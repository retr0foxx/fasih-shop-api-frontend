
class ResourceListResponse<T extends Resource<T>>
{
    data: T[];
    total_count: number;
    constructor(data: T[], total_count: number)
    {
        this.data = data;
        this.total_count = total_count;
    }
}

abstract class Resource<T extends Resource<T>>
{
    static resource_name: string;
    // used for, well, the endpoint and when getting many of the same resources
    static resource_endpoint: string;
    // used for get_by_id
    static resource_response_key: string;

    id: number;
    constructor(id: number)
    {
        this.id = id;
    }

    static abstract from_json(): Resource;

    static async get_resources(): Promise<ResourceListResponse<Resource<T>>>
    {
    }

    static async get_resource(): Promise<ResourceListResponse<Resource<T>>>
    {

    }
}

class Item extends Resource
{

}