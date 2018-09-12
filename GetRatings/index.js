const CosmosClient = require("@azure/cosmos").CosmosClient;

module.exports = async function (context, req) {
    const endpoint = "https://team9c2.documents.azure.com:443/";
    const masterKey = "FlKzLqW8OQahFijkKQ5oF0c56gd2ZnZgIHNmdSg2XsrJQzz7CfQ3bW2R5hNY0jYLv8QCJR4S3vd5TBF2MzFppA==";  // Add the masterkey of the endpoint
    const client = new CosmosClient({endpoint, auth: { masterKey }});
    
    const databaseDefinition = { id: "challenge2cosmos" };
    const collectionDefinition = { id: "ratings" };

    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.query.userId) {
        const querySpec = {
            query: "SELECT * FROM ratings WHERE ratings.userId = @id",
            parameters: [
                {
                    name: "@id",
                    value: req.query.userId
                }
            ]
        };
        
        try {
            const { database: db } = await client.databases.createIfNotExists(databaseDefinition);
            const { container } = await db.containers.createIfNotExists(collectionDefinition);
            context.log(container.items);
            const { result: results } = await container.items.query(querySpec).toArray();

            context.log(results);
            if(results.length>0){
                context.res = {
                    // status: 200, /* Defaults to 200 */
                    body: results
                };
            }
            else{
                context.res = {
                    status: 404, /* Defaults to 200 */
                    body: "Not found"
                };
            }
        } catch(err) {
            context.log(err);
        }

        
        
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a userId on the query string or in the request body"
        };
    }
};