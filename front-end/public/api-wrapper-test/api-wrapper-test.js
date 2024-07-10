
const shopapi = require("../api-wrapper");
let fsProm = require("node:fs/promises");

function random_integer(start, end)
{
    return start + Math.floor(Math.random() * (end - start + 1));
}

function random_string(length, letters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
{
    let string = "";
    for (let i = 0; i < length; ++i)
        string += letters[random_integer(0, letters.length - 1)];

    return string;
}

console.log(random_string(5));

const PASSWORD = "wysi lmao";

// returns the username
async function create_random_user(password)
{
    while (true)
    {
        try
        {
            let random_name = random_string(20);
            // console.log(random_name);
            let created_id = await shopapi.User.register_user(random_name, password);
            console.log(created_id);
            // await new Promise((resolver) => setInterval(resolver, 1000));
            return [random_name, created_id];
        }
        catch (e)
        {
            // console.log(e);
            if (!(e instanceof shopapi.ResourceExistsError))
                throw e;
        }
    }
}

async function get_all_users_paging(users_per_page)
{
    let current_users;
    let users = [];
    let page = 0; // i hope it really does start from zero
    while (1)
    {
        current_users = await shopapi.User.get_users(users_per_page, page);
        // console.log(`Page ${page}:`, current_users.data);
        if (current_users.data.length > users_per_page)
        {
            throw new Error(`Testing error: more pages than requested, ${current_users.data.length} vs ${users_per_page}`);
        }
        page += 1;
        if (current_users.data.length == 0)
            break;

        users.push(...current_users.data);
        // console.log(current_users.data);
    }
    if (current_users.total_count != users.length)
        console.log(`total_count and actual received count don't match: ${current_users.total_count} vs ${users.length}`);

    return users;
}

// very slow function duh
// strategy:
// 1. for each nth letter, make a set out of the nth letter of all strings,
// 2. substract allowed letters by it
// 3. if empty then pick a random one for the nth character of the resulting string go to the next letter. 
// 4. if not empty then pick a character from that substraction then STOP.
function create_nonexistent_string(list_of_strings, allowed_letters=new Set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"))
{
    let result = "";
    let last_substraction = null;
    while (1)
    {
        let current_set = new Set();
        let idx = result.length;
        for (let i = 0; i < list_of_strings.length; ++i)
            if (list_of_strings[i].length > idx)
                current_set.add(list_of_strings[i][idx]);
        
        // console.log(current_set);
        last_substraction = allowed_letters.difference(current_set);
        // console.log(last_substraction);
        if (last_substraction.size != 0)
        {
            result += last_substraction.values().next().value;
            break;
        }
        else
            result += current_set.values().next().value;
    }
    return result;
}

/*
Things I need to test:
1. User creation
   a. Already exists
   b. Doesn't already exist
2. User listing
   a. Pagination
   b. No pagination
3. User get id/username
   a. Exists
   b. Doesn't exist
4. User login
   a. Wrong password
   b. Correct password
   c. Does not exist
5. User deletion
   a. Exists
   b. Doesn't exist

Strategy:
- Create 20 users that doesn't already exist (1.b)
- Recreate one of the 20 users (1.a)
- List ALL users with at most 5 items per page (2.a)
- Then compare with list all users (2.b)
- Get one of the list of users by ID and username (3.a)
- Login to one of the created users (4.a, 4.b)
- Try to get a non-existent user by ID (3.b)
- Login to a non-existent user (4.c)

1. Item creation
2. Item listing
   a. Pagination
   b. No pagination
3. Item editing
   a. Exists
   b. Doesn't exist
4. Item deletion
   a. Exists
   b. Doesn't exist
5. Item get by ID
   a. Exists
   b. Doesn't exist
6. Item by name
7. Item get image
   a. Item has image
   b. Item doesn't have image
8. Item by get creator ID
   a. Creator exists
   b. Creator don't exist

Strategy:
- Choose two creator ID
- Create 10 items that don't already exist with images from creator A (1)
- Create 10 items that don't already exist without images from creator B
- List items (2.a, 2.b)
- Get item by creator ID (8)
- Edit one of the created items (3.a)
- Get one of the created items by ID (5.a)
- Try to get one of the created items by name (6)
- Get item image (7.b, 7.a)
- Delete all the items we've made (4.a)
- Delete one of the items that has been deleted (4.b)
*/


async function do_all_the_tests()
{
    let item_image = await fsProm.open("./test_image.png");
    let item_image_stat = await item_image.stat();
    if (item_image_stat.size > 10_000_000)
        throw new Error("wait why is the image file so massive");

    let read_data = Buffer.alloc(item_image_stat.size);
    await item_image.read(read_data, 0, item_image_stat.size, 0);
    
    item_image.close();
    item_image = new Blob([read_data], { type: "image/png" });
    
    const N_users = 11;
    const paging_users_per_page = 5;

    console.log(`Creating ${N_users} users...`);
    let created_usernames = [];
    let created_ids = [];
    for (let i = 0; i < N_users; ++i)
    {
        let [created_username, created_id] = await create_random_user(PASSWORD);
        created_usernames.push(created_username);
        created_ids.push(created_id);
    }
    console.log("Created users:", created_usernames);

    console.log("Recreating user ", created_usernames[0]);
    let thrown = false;
    try
    { await shopapi.User.register_user(created_usernames[0], PASSWORD) }
    catch (e) { thrown = true; if (!(e instanceof shopapi.ResourceExistsError)) throw e; }
    if (thrown == false)
        console.log("Failed test 1.a since it didn't throw an error");
    
    console.log("Finished test 1.a");

    let all_users_paging = await get_all_users_paging(paging_users_per_page);
    let all_users = (await shopapi.User.get_users()).data;
    // console.log("All users with paging:", all_users_paging);
    // console.log("All users:", all_users);
    if (all_users_paging.length != all_users.length)
        console.log("Failed test 2.a since the lengths doesn't match ", all_users_paging.length, " vs ", all_users.length);

    console.log("Finished test 2.a");
    let existing_id = all_users_paging[1].id;
    let existing_username = all_users_paging[1].username;
    console.log("Existing ID and username:", existing_id, existing_username);

    /* @type {shopapi.User} */
    let by_id = await shopapi.User.get_by_id(existing_id);
    console.log("By id:", by_id);
    if (by_id.username != existing_username || by_id.id != existing_id)
        console.log(`Failed test 3.a since username or id doesn't match. ID should be ${existing_id}; username should be '${existing_username}'`);

    console.log("Finished test 3.a");
    existing_id = undefined;
    existing_username = created_usernames[0];
    // will be used later
    let token = await shopapi.User.auth(existing_username, PASSWORD);
    console.log("Got token:", token);
    console.log("Finished test 4.b");

    try
    {
        let should_fail = await shopapi.User.auth(created_usernames[1], PASSWORD + "slkjdf");
        console.log("Failed test 4.a since it didn't throw an error")
    }
    catch (e)
    {
        if (!(e instanceof shopapi.AuthenticationError))
            throw e;
    }
    console.log("Finished test 4.a");

    let all_usernames = [...all_users.map((value) => value.username)];
    let nonexistent_username = create_nonexistent_string(all_usernames);
    
    try
    {
        let should_fail = await shopapi.User.auth(nonexistent_username, PASSWORD);
        console.log("Failed test 4.c since it didn't throw an error")
    }
    catch (e)
    {
        if (!(e instanceof shopapi.ResourceNotFoundError))
            throw e;
    }
    console.log("Finished test 4.c");
    let nonexistent_id = Math.max([...all_users.map((value) => value.id)]) + 1;
    try
    {
        let shuold_fail = await shopapi.User.get_by_id(nonexistent_id);
        console.log("Failed test 3.b since it didn't throw an error")
    }
    catch (e)
    {
        if (!(e instanceof shopapi.ResourceNotFoundError))
            throw e;
    }
    console.log("Finished test 3.b");

    // ==================NOW FOR THE ITEM API==========================
    all_users = (await shopapi.User.get_users()).data;
    let creators = [created_usernames[0], created_usernames[1]];
    let creator_ids = [created_ids[0], created_ids[1]];
    let creators_jwts = [];
    for (let i = 0; i < creators.length; ++i)
        creators_jwts.push(await shopapi.User.auth(creators[i], PASSWORD));

    let created_items = [[], []];
    console.log("Creator JWTs:", creators_jwts);
    console.log("Creating many items...");

    for (let u = 0; u < 2; ++u)
    {
        for (let i = 0; i < 10; ++i)
        {
            console.log("your felsh");
            let new_item_id = await shopapi.Item.create_item(new shopapi.Item(
                null, `Gaming laptop number ${i + 1}`, 727 + i,
                "This is the best gaming laptop you've ever seen!!",
                null, u == 1 ? null : item_image
            ), creators_jwts[u]);
            created_items[u].push(new_item_id);
        }
    }
    console.log("Created items:", created_items);

    console.log("Getting all items by paging and no paging...");
    let items_paging = [];
    let paging_i = 0;
    while (1)
    {
        let items = await shopapi.Item.get_items(5, paging_i);
        if (items.data.length == 0)
            break;

        paging_i += 1;
        items_paging.push(...items.data);
    }
    let items_nopaging = (await shopapi.Item.get_items()).data;

    if (items_paging.length != items_nopaging.length)
        console.log(`items_paging.length != items_nopaging.length, ${items_paging.length} != ${items_nopaging.length}`);
    else
        console.log("Their lengths match");

    let created_by_0 = (await shopapi.Item.get_by_creator_id(creator_ids[0])).data;
    let created_by_1 = (await shopapi.Item.get_by_creator_id(creator_ids[1])).data;
    console.log(`Should be created by ${creator_ids[0]}: `, created_by_0.map(user => [user.id, user.creator]));
    console.log(`Should be created by ${creator_ids[1]}: `, created_by_1.map(user => [user.id, user.creator]));

    console.log("Deleting all of the created items...");
    for (let u = 0; u < 2; ++u)
    {
        for (let i = 0; i < 10; ++i)
        {
            let the_id = created_items[u][i];
            try
            {
                console.log(creators_jwts[!u]);
                await shopapi.Item.delete_item(the_id, creators_jwts[!u]);
                console.log("wrong authentication while deleting, it shouldve errored man");
            }
            catch (e)
            {
                // console.log("errored", e, "when deleting with wrong auth");
                if (!(e instanceof shopapi.AuthenticationError))
                    throw e;
            }
            // console.log(creators_jwts[u]);
            await shopapi.Item.delete_item(the_id, creators_jwts[u]);
        }
    }
    console.log("Checking if the deleted items still exist...");
    items_nopaging = (await shopapi.Item.get_items()).data;
    let all_created_items = new Set([...created_items[0], ...created_items[1]]);
    let the_intersection = (new Set(items_nopaging.map(item => item.id))).intersection(all_created_items);
    console.log("Intersection:", the_intersection);
    if (the_intersection.size != 0)
        throw new Error("Error: items nto actually deleted!");

    // console.log("Intersected", all_created_items_set, "with", new Set(items_nopaging.map(item => item.id)));
    all_created_items = [...all_created_items];
    // i am so fucking done making these tests.
}

do_all_the_tests();
