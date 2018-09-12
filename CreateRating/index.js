const axios = require("axios");
const CosmosClient = require("@azure/cosmos").CosmosClient;

module.exports = async function (context, req) { 
    const endpoint = "https://team9c2.documents.azure.com:443/";
    const masterKey = "FlKzLqW8OQahFijkKQ5oF0c56gd2ZnZgIHNmdSg2XsrJQzz7CfQ3bW2R5hNY0jYLv8QCJR4S3vd5TBF2MzFppA==";  // Add the masterkey of the endpoint
    const client = new CosmosClient({endpoint, auth: { masterKey }});
    
    const databaseDefinition = { id: "challenge2cosmos" };
    const collectionDefinition = { id: "ratings" };
    
    if (req.body && req.body.userId && req.body.productId && req.body.rating && req.body.locationName && req.body.userNotes) {
        const getProductURL = 'https://serverlessohproduct.trafficmanager.net/api/GetProduct?productId=' + req.body.productId;
        const getUsersURL = 'https://serverlessohuser.trafficmanager.net/api/GetUser?userId=' + req.body.userId;

        console.log(getProductURL)
        console.log(getUsersURL)

        let productResponse = {};
        let userResponse = {};
        try {
            productResponse = await axios.get(getProductURL);
            userResponse = await axios.get(getUsersURL);
        } catch (error) {
            console.log(error);
            context.res = {
                status: 404,
                body: "Error"
            }
            return;
        }

        const ratingNum = req.body.rating;
        if (productResponse.status == 400 || userResponse.status == 400 ||
            !Number.isInteger(ratingNum) || ratingNum < 0 || ratingNum > 5
        ) {
            context.res = {
                status: 400,
                body: "400 Error"
            }
        } else {
            const timestamp = new Date();
            req.body['id'] = uuidv4();
            req.body['timestamp'] = timestamp.toUTCString();

            context.res = {
                status: 200,
                body: req.body
            }

            const itemDefinition = req.body;
            try {
                const { database: db } = await client.databases.createIfNotExists(databaseDefinition);
                const { container } = await db.containers.createIfNotExists(collectionDefinition);
                await container.items.create(itemDefinition);
            } catch(err) {
                context.log(err);
            }
        }
    }

    context.log('JavaScript HTTP trigger function processed a request.');
};

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}