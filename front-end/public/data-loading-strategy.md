
# Regarding the way data is loaded

For the data processing, there will be a page load promise that will be manually resolved when the page loads. There will be an asynchronous function for requesting the actual data which will have access to the page load promise and will await it when it finishes requesting the data and is about to actual display them into the page.

So it looks kind of like this

- Head: Page load promise, data processing asynchronous function, calling the data processing asynchronous function
- Body: Resolve the page load promise

For example:

Head:
```
let load_promise_resolver;
let load_promise = new Promise((resolver) => load_promise_resolver = resolver);

async function get_data()
{
    // ... actually requesting the data
    await load_promise;
    // ... actually displaying the data
}
```

A script at the bottom of the body:
```
load_promise_resolver();
```

For more details on displaying the data, it first cleans up the loading screen and then it usually has an HTML template element for the data and renders the data based on that by simply appending it into the body. 


...Why do this, though? What's wrong with having a separate function dedicated for requesting data, and then calling that and putting that into a promise variable on the head section, and then `.then`-ing that on the body somehow? I'm going to do that for the item listing page.