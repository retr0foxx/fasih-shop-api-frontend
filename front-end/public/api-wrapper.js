const SHOP_API_HOSTNAME = "localhost";
const SHOP_API_PORT = 7272;
const SHOP_API_URL = `http://${SHOP_API_HOSTNAME}:${SHOP_API_PORT}`;

function shopapi_send_simple_json_request(url, method, jsonified_data)
{
    return fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonified_data)
    });
}

class ResourceNotFoundError extends Error
{
    constructor(message)
    {
        super(message);
        this.name = "ResourceNotFoundError";
    }
}

class ForbiddenError extends Error
{
    constructor(message)
    {
        super(message);
        this.name = "ForbiddenError";
    }
}

class AuthenticationError extends Error
{
    constructor (message)
    {
        super(message);
        this.name = "AuthenticationError";
    }
}

class InvalidParameterError extends Error
{
    constructor (message)
    {
        super(message);
        this.name = "InvalidParameterError";
    }
}

class ResourceExistsError extends Error
{
    constructor (message)
    {
        super(message);
        this.name = "ResourceExistError";
    }
}

class ResourceList
{
    /**
     * 
     * @param {Item|User} resource_type 
     * @param {Resource[]} data - The list of resources
     * @param {number} total_count - The total amount of that data that exists. NOT the amount of data received
     */
    constructor (resource_type, data, total_count)
    {
        this.resource_type = resource_type;
        this.data = data;
        this.total_count = total_count;
    }
}

function shopapi_throw_resp_status(resp)
{
    throw new Error(`HTTP error status ${resp.status}`);
}

/*
The thought here is that get_reousrces and get_resource
are generic functions that can be used to request resources
since, on the api, the way you get singular resource by id and 
the way you get all of the resources are very similar.

Then in the end, the classes which inherits the Resource class
actually redefine the get resources/get resource with a name
which coincides with the actual resource name
but then it implements it using the general get resources/get resource
functions.
*/
class Resource
{
    constructor (id)
    {
        this.id = id;
    }

    /**
     * 
     * @param {User|Item} type - The type of the data
     * @param {('item'|'user')} key - The data key for the response JSON
     * @param {number?} limit - Paging limit 
     * @param {number?} page - Paging page
     * @returns 
     */
    static async get_resources(type, key, limit=null, page=null)
    {
        if ((limit && !Number.isInteger(limit)) || (page && !Number.isInteger(page)))
            throw new InvalidParameterError("Limit and page parameters must be integers");

        let search_params = new URLSearchParams();
        if (limit) search_params.set("limit", limit);
        if (page) search_params.set("page", page);
        search_params = search_params.toString();
        console.log(`${SHOP_API_URL}/${key}/?${search_params}`, "limit:", limit, ", page:", page);
        let fetched = await fetch(`${SHOP_API_URL}/${key}/?${search_params}`, {
            method: "GET"
        });

        if (!fetched.ok)
            shopapi_throw_resp_status(fetched);

        let json_data = await fetched.json();

        // console.log("JSONDATA:", json_data);
        return new ResourceList(
            type,
            [...json_data[key].map((value) => type.from_json(value))],
            json_data["total_count"]
        );
    }

    /**
     * 
     * @param {Item|User} type 
     * @param {('items'|'users')} endpoint 
     * @param {('item'|'user')} response_key - The data key in the JSON response
     * @param {number} id 
     * @returns {Item|User}
     */
    static async get_resource(type, endpoint, response_key, id)
    {
        let response = await fetch(
            `${SHOP_API_URL}/${endpoint}/id/${id}`,
            { method: "GET" }
        );

        console.log(response.ok, response.status);
        if (!response.ok)
        {
            if (response.status == 404)
                throw new ResourceNotFoundError(`There is no ${response_key} with id ${id}`);

            shopapi_throw_resp_status(response);
        }

        let json_data = await response.json();
        return type.from_json(json_data[response_key]);
    }
}


class Item extends Resource
{
    // creator is either an integer ID or a User object.
    constructor(id, name, price, description, item_image_name, item_image_blob=null, creator_id=null, created_at=null, updated_at=null)
    {
        super(id);
        this.name = name;
        this.price = price;
        this.description = description;
        this.item_image_name = item_image_name;
        this.item_image_blob = item_image_blob;
        this.creator_id = creator_id;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static from_json(json)
    {
        return new Item(
            json["id"],
            json["itemName"],
            json["price"],
            json["description"],
            json["itemImage"] == null ? null : json["itemImage"],
            null,
            json["itemCreatorId"],
            json["createdAt"],
            json["updatedAt"]
        );
    }

    // will not set the itemImage
    // id will be set if setid is true
    set_formdata(formdata, setid=false)
    {
        if (setid)
            formdata.set("id", this.id);
        
        formdata.set("itemName", this.name);
        formdata.set("price", this.price);
        formdata.set("description", this.description);
        if (this.item_image_blob != null)
            formdata.set("itemImage", this.item_image_blob);
    }

    static async get_all(limit, page)
    {
        return await Resource.get_resources(Item, "items", limit, page);
    }

    static async get_by_name(name, limit, page)
    {
        if ((limit && !Number.isInteger(limit)) || (page && !Number.isInteger(page)))
            throw new InvalidParameterError("Limit and page parameters must be integers");

        let search_params = new URLSearchParams();
        if (limit) search_params.set("limit", limit);
        if (page) search_params.set("page", page);
        search_params = search_params.toString();
        let response = await fetch(
            `${SHOP_API_URL}/items/itemname/${encodeURIComponent(name)}/?${search_params}`,
            { method: "GET" }
        );
        
        if (!response.ok)
            shopapi_throw_resp_status(response);

        let json_response = await response.json();

        return new ResourceList(
            Item,
            json_response["items"].map((item) => Item.from_json(item)),
            json_response["total_count"]
        );
    }

    static async get_by_creator_id(id, limit, page)
    {
        if ((limit && !Number.isInteger(limit)) || (page && !Number.isInteger(page)))
            throw new InvalidParameterError("Limit and page parameters must be integers");

        let search_params = new URLSearchParams();
        if (limit) search_params.set("limit", limit);
        if (page) search_params.set("page", page);
        search_params = search_params.toString();
        let response = await fetch(
            `${SHOP_API_URL}/items/creatorid/${id}?${search_params}`,
            { method: "GET" }
        );

        // TODO: Catch the 404 user not found error when I implement it
        if (!response.ok)
            shopapi_throw_resp_status(response);

        let json_response = await response.json();
        return new ResourceList(
            Item,
            json_response.items.map(item => Item.from_json(item)),
            json_response.total_count
        );
    }

    static async get_by_id(id)
    {
        return Resource.get_resource(Item, "items", "item", id);
    }

    static get_image_url_by_id(id)
    {
        return `${SHOP_API_URL}/items/id/${id}/image`;
    }

    async get_image_url()
    {
        return Item.get_image_url_by_id(this.id);
    }

    // returns the ID of the created item
    static async create(item, jwt_auth)
    {
        let form_data = new FormData();
        item.set_formdata(form_data);

        // console.log(Array.from(form_data.entries()));

        // console.log("WHAT THE FUCK IS GOING ON!!!??!?!?!");
        let response = await fetch(`${SHOP_API_URL}/items/`, {
            method: "POST",
            headers: {
                // "Content-Type": "multipart/form-data",
                "Authorization": "Bearer " + jwt_auth
            },
            body: form_data
        });
        console.log("HELLO");
        if (!response.ok)
        {
            if (response.status == 401)
                throw new AuthenticationError("Invalid authentication token.");

            shopapi_throw_resp_status(response);
        }
        return (await response.json()).id;
    }

    static async update(item, jwt_auth)
    {
        let form_data = new FormData();
        item.set_formdata(form_data);

        console.log(form_data.entries());

        let response = await fetch(`${SHOP_API_URL}/items/${item.id}`, {
            method: "PATCH",
            headers: {
                // "Content-Type": "multipart/form-data",
                "Authorization": "Bearer " + jwt_auth
            },
            body: form_data
        });
        if (!response.ok)
        {
            if (response.status == 401)
                throw new AuthenticationError("Invalid authentication token.");

            if (response.status == 404)
                throw new ResourceNotFoundError(`Item with ID ${item.id} does not exist`);

            shopapi_throw_resp_status(response);
        }
    }

    static async delete(id, jwt_auth)
    {
        console.log(`Debug ${(new Error()).lineNumber} deleting user ID ${id}, ${jwt_auth}`);
        let response = await fetch(`${SHOP_API_URL}/items/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + jwt_auth
            }
        });

        if (!response.ok)
        {
            if (response.status == 401)
                throw new AuthenticationError("Invalid authentication token.");

            if (response.status == 404)
                throw new ResourceNotFoundError(`Item with ID ${id} does not exist`);

            shopapi_throw_resp_status(response);
        }
    }
}

class User extends Resource
{
    constructor(id, username, created_at=null)
    {
        super(id);
        this.username = username;
        this.created_at = created_at;
    }

    static from_json(data)
    {
        // Iconsole.log(data);
        return new User(data.id, data.username, data.createdAt);
    }

    static async get_users(limit=null, page=null)
    {
        return await Resource.get_resources(User, "users", limit, page);
    }

    /**
     * 
     * @param {number} id User ID
     * @returns {User}
     */
    static async get_by_id(id)
    {
        return Resource.get_resource(User, "users", "user", id);
    }

    /**
     * Creates a user
     * @param {string} username 
     * @param {string} password 
     * @returns {number} The id of the created user
     */
    static async register_user(username, password)
    {
        let response = await shopapi_send_simple_json_request(
            `${SHOP_API_URL}/users`, "POST",
            { username: username, password: password }
        );
        if (!response.ok)
        {
            console.log("Error:", response);
            if (response.status == 409)
                throw new ResourceExistsError(`User with username \'${username}\' already exists`);

            shopapi_throw_resp_status(response);
        }
        return (await response.json()).id;
    }

    static async get_by_token(token)
    {
        let response = await fetch(
            `${SHOP_API_URL}/users/token`,
            {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            }
        );
        if (!response.ok)
        {
            if (response.status == 401)
                throw new AuthenticationError("Invalid token error");

            shopapi_throw_resp_status(response);
        }
        let response_json = await response.json();
        return User.from_json(response_json.user);
    }

    /**
     * Authenticate a user
     * @param {string} username 
     * @param {string} password 
     * @returns {string} The JWT auth token
     */
    static async auth(username, password)
    {
        let response = await shopapi_send_simple_json_request(
            `${SHOP_API_URL}/users/login`, "POST", 
            { username, password }
        );
        if (!response.ok)
        {
            if (response.status == 404)
                throw new ResourceNotFoundError(`User with username ${username} does not exist.`);
            if (response.status == 401)
                throw new AuthenticationError(`Wrong password for username ${username}`);

            shopapi_throw_resp_status(response);
        }
        let json_response = await response.json();
        return [json_response.token, json_response.id];
    }
}

if (typeof module !== 'undefined' && module.exports)
{
    module.exports = {
        ResourceNotFoundError,
        ResourceExistsError,
        AuthenticationError,
        ForbiddenError,
        InvalidParameterError,

        ResourceList,
        Resource,
        Item,
        User
    };
}

