// const LAMBDA_URL = "https://yy67udxfjqcui2f65hr7xvt44m0cikjn.lambda-url.us-east-2.on.aws/"
const bucketName = "www.sponsorlist.org";
const folderName = "data/";

class S3Service {
    constructor() {
        AWS.config.region = "us-east-2"; // Region
        AWS.config.credentials = AWS.config.credentials || new AWS.CognitoIdentityCredentials({
            IdentityPoolId: "us-east-2:fadf8d53-931f-459e-906b-d56f3890a66a",
        });

        this.s3 = new AWS.S3({
            apiVersion: '2006-03-01',
            params: { 
                Bucket: bucketName
            },
        });
    }

    listObjects(folder = folderName, delim = "/") {
        return new Promise((resolve, reject) => {
            this.s3.listObjectsV2({ Delimiter: delim, Prefix: folder }, function(err, data) {
                if (err)  {
                    return reject("There was an error listing data: " + err.message)
                };

                // console.log("data: ");
                // console.log(data);
                var itemList = data.Contents.length == 0 ? 
                    data.CommonPrefixes.map(function (commonPrefix) {
                        // console.log("commonPrefix: ");
                        // console.log(commonPrefix);
                        var prefix = commonPrefix.Prefix;
                        // var item = decodeURIComponent(prefix.replace("/", ""));
                        var item = decodeURIComponent(prefix);
                        return item;
                    }) :
                    data.Contents.map(function (content) {
                        // console.log("content: ");
                        // console.log(content);
                        var item = decodeURIComponent(content.Key);
                        return item;
                    });
                resolve(itemList);
            });
        });
    }

    getObject(name) {
        return new Promise((resolve, reject) => {
            this.s3.getObject({ Key: name }, (err, data) => {
                if (err)  {
                    return reject(err)
                };

                // console.log("data: ");
                // console.log(data);
                const text = new TextDecoder('utf-8').decode(data.Body);
                // console.log("text: ");
                // console.log(text);
                resolve(text);
            });
        });
    }

    putObject(body) {
        let user = body['user'] ? body['user'] : auth.user.profile["cognito:username"] ? auth.user.profile["cognito:username"] : "testUser";
        // let date = body["added"] ? body["added"] : new Date();
        let dateString = new Date(body["added"]).toISOString().split("T");
        let year = dateString[0].split("-")[0];
        let month = dateString[0].split("-")[1];
        let day = dateString[0].split("-")[2];
        var key = year + "/" + month + "/" + day + "/" + 
                    encodeURIComponent(body["personality"] + "-" + body["sponsor"] + "-" + user ) + ".json";

        return new Promise((resolve, reject) => {
            this.s3.putObject(
                { Key: folderName + key, Body: JSON.stringify(body), ContentType: "application/json"},
                (err, data) => {
                    if (err)  {
                        return reject(err)
                    };
                    resolve(true);
                }
            )
        })
    }

    deleteObject(name) {
        this.s3.deleteObject({ Key: folderName + name }, function (err, data) {
            if (err) {
                console.log("There was an error deleting your photo: ", err.message);
                return;
            }
            console.log("Successfully deleted item.");
        });
    }
}

class S3Migration {
    constructor(s3Service) {
        this.service = s3Service;
    }

    // Check if a key is in old format (data/YYYY-MM-DD/...)
    isOldFormat(key) {
        const oldFormatPattern = /^data\/\d{4}-\d{2}-\d{2}\//;
        return oldFormatPattern.test(key);
    }

    // Convert old format path to object data
    async migrateOldFormatKey(oldKey) {
        try {
            console.log(`Migrating: ${oldKey}`);
            
            // Get the object data from old location
            const objectData = await this.service.getObject(oldKey);
            const sponsor = JSON.parse(objectData);
            
            // Use the existing putObject method which uses new format
            await this.service.putObject(sponsor);
            console.log(`✓ Re-uploaded with new format: ${sponsor.personality} - ${sponsor.sponsor}`);
            
            // Delete the old object
            await this.deleteOldObject(oldKey);
            console.log(`✓ Deleted old format: ${oldKey}`);
            
            return true;
        } catch (error) {
            console.error(`✗ Failed to migrate ${oldKey}:`, error);
            return false;
        }
    }

    // Delete object (promisified version)
    deleteOldObject(key) {
        return new Promise((resolve, reject) => {
            this.service.s3.deleteObject({ Key: key }, function (err, data) {
                if (err) {
                    console.error("Error deleting object:", err.message);
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    // List all objects recursively (handles nested folders)
    async listAllObjects(prefix = folderName) {
        const allKeys = [];
        
        const listRecursive = async (currentPrefix) => {
            const params = {
                Prefix: currentPrefix,
                Delimiter: ''  // No delimiter to get all objects, not just folders
            };
            
            return new Promise((resolve, reject) => {
                this.service.s3.listObjectsV2(params, (err, data) => {
                    if (err) return reject(err);
                    
                    // Add all object keys to our array
                    if (data.Contents) {
                        data.Contents.forEach(item => {
                            if (item.Key.endsWith('.json')) {
                                allKeys.push(item.Key);
                            }
                        });
                    }
                    
                    resolve();
                });
            });
        };
        
        await listRecursive(prefix);
        return allKeys;
    }

    // Main migration function
    async migrateAllOldFormat() {
        console.log("Starting migration of old format objects...");
        
        try {
            // Get all objects in the bucket
            const allKeys = await this.listAllObjects();
            console.log(`Found ${allKeys.length} total objects`);
            
            // Filter for old format keys
            const oldFormatKeys = allKeys.filter(key => this.isOldFormat(key));
            console.log(`Found ${oldFormatKeys.length} objects in old format`);
            
            if (oldFormatKeys.length === 0) {
                console.log("No old format objects to migrate!");
                return { success: 0, failed: 0, total: 0 };
            }
            
            // Migrate each old format object
            let successCount = 0;
            let failedCount = 0;
            
            for (const oldKey of oldFormatKeys) {
                const result = await this.migrateOldFormatKey(oldKey);
                if (result) {
                    successCount++;
                } else {
                    failedCount++;
                }
            }
            
            console.log(`\n=== Migration Complete ===`);
            console.log(`✓ Successfully migrated: ${successCount}`);
            console.log(`✗ Failed: ${failedCount}`);
            console.log(`Total: ${oldFormatKeys.length}`);
            
            return { success: successCount, failed: failedCount, total: oldFormatKeys.length };
            
        } catch (error) {
            console.error("Migration failed:", error);
            throw error;
        }
    }

    // Single object migration (for manual use)
    async migrateSingleObject(oldKey) {
        if (!this.isOldFormat(oldKey)) {
            console.log(`${oldKey} is not in old format, skipping`);
            return false;
        }
        
        return await this.migrateOldFormatKey(oldKey);
    }
}
