function create_html_element(tagname, attributes, object_attributes)
{
    let result = document.createElement(tagname);
    if (attributes != null)
        for (let [key, value] of Object.entries(attributes))
            result.setAttribute(key, value);

    if (object_attributes != null)
        for (let [key, value] of Object.entries(object_attributes))
            result[key] = value;

    return result;
}