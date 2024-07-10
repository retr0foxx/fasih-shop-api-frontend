// TODO: handle when there are no cookies
function load_all_cookies()
{
    /*return new Map(document.cookie.split(";").map(cookie => {
        cookie = cookie.trim();
        cookie.split("=").map(data => decodeURIComponent(data));
        return cookie;
    }));*/
    return document.cookie.split(";").reduce(
        (acc, curval) => {
            let trim = curval.trim();
            if (trim == "") return acc;
            acc.set(...(curval.split("=").map((value) => encodeURIComponent(value.trim()))));
            return acc;
        },
        new Map()
    );
}

function delete_cookie(cookie_name)
{
    let the_past = (new Date((new Date()).getTime() - 1000)).toUTCString();
    document.cookie = `${cookie_name}=;expires=${the_past}`;
}

function delete_cookies(...cookie_name)
{
    for (let i = 0; i < cookie_name.length; ++i)
        delete_cookie(cookie_name[i]);
}

function create_basic_cookie_string(key, value, expiration_offset_ms=null)
{
    let final = `${encodeURIComponent(key)}=${encodeURIComponent(value)};`;
    if (expiration_offset_ms)
    {
        let exptime = (new Date((new Date()).getTime() + expiration_offset_ms)).toUTCString();
        final += `expires=${exptime};`;
    }
    return final;
}