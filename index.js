const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var admin = require("firebase-admin");
const app = express()
const port = process.env.PORT || 3000


var serviceAccount = require("path/to/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// middleWare
app.use(cors())
app.use(express.json())


const verifyFireBaseToken = (req, res, next) =>{
    if(!req.headers.authorization){
        return res.status(401).send({message:'unauthorized access'})
    }
    const token = req.headers.authorization.split(' ')[1]
    if(!token){
         return res.status(401).send({message:'unauthorized access'})
    }

    // verify id token

}

const uri = "mongodb+srv://pawmart-db:GHnmHkKJbbxzJkcg@cluster0.cnb6fbt.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const db = client.db('pawmart-db')
        const listingsCollection = db.collection('listing')
        const ordersCollection = db.collection('orders')

        app.get('/products', async (req, res) => {
            const email = req.query.email
            const query = {}
            if (email) {
                query.email = email
            }
            const cursor = listingsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/products', async (req, res) => {
            const newProduct = req.body
            const result = await listingsCollection.insertOne(newProduct)
            res.send(result)
        })

        app.patch('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const newProduct = req.body
            const update = {
                $set: {
                    name: newProduct.name,
                    category: newProduct.category,
                    price: newProduct.price,
                    location: newProduct.location,
                    description: newProduct.description,
                    image: newProduct.image,
                    date: newProduct.date
                }
            }
            const result = await listingsCollection.updateOne(query, update)
            res.send(result)

        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = {
                _id: new ObjectId(id)
            }
            const result = await listingsCollection.findOne(query)

            res.send(result)
        })

        app.get('/latest-products', async (req, res) => {
            const cursor = listingsCollection.find({}).limit(6)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/categories/:category', async (req, res) => {
            const category = req.params.category
            const formatted = category.charAt(0).toUpperCase() + category.slice(1)
            const query = {
                category: formatted
            }
            const cursor = listingsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)

        })


        // orders api
        app.get("/orders", async(req, res)=>{
            const email = req.query.email
            const query = {}
            if(email){
                query.email = email
            }
            const cursor = ordersCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        app.post("/orders", async (req, res) => {
            
                const {
                    productId,
                    productName,
                    buyerName,
                    email,
                    quantity,
                    price,
                    address,
                    phone,
                    pickupDate,
                    notes
                } = req.body;

                
                if (!productId || !email || !buyerName) {
                    return res.status(400).send({
                        success: false,
                        message: "Required fields missing"
                    });
                }

                
                const safeQuantity = quantity > 0 ? quantity : 1;

                const order = {
                    productId,
                    productName,
                    buyerName,
                    email,
                    quantity: safeQuantity,
                    price,
                    address,
                    phone,
                    pickupDate,
                    notes,
                    
                };

                const result = await ordersCollection.insertOne(order);

                res.status(201).send({
                    success: true,
                    message: "Order placed successfully",
                    insertedId: result.insertedId
                });

            
        });

        





        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// pawmart-db
// GHnmHkKJbbxzJkcg