const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
// const jwt = require("jsonwebtoken");
require("dotenv").config();
// const stripe = require("stripe")(process.env.STRIKE_SECRET);
const port = process.env.PORT || 5000;

///////////////midleware///////////////////////
app.use(cors());
app.use(express.json());
/////////////////////////////////////

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ejrymvb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
/////////////////////////////////////
async function run() {
  try {
    const catagoriescollection = client
      .db("last-assignment")
      .collection("catagories");
    const itemscollection = client.db("last-assignment").collection("items");
    const bookingscollection = client
      .db("last-assignment")
      .collection("booking");

    //////////////// items and collections////////////////////////////
    app.get("/items", async (req, res) => {
      const query = {};
      const result = await itemscollection.find(query).toArray();
      res.send(result);
    });
    app.get("/catagories", async (req, res) => {
      const query = {};
      const result = await catagoriescollection.find(query).toArray();
      res.send(result);
    });

    app.get("/catagory/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { category_id: id };
      const result = await catagoriescollection.find(filter).toArray();
      res.send(result);
    });
    ////////////////////bookings part//////////////////////////////
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      console.log(booking);

      const query = {
        name: booking.name,
        email: booking.email,
      };
      const alreadybooked = await bookingscollection.find(query).toArray();
      if (alreadybooked.length) {
        const message = `you already booked on ${booking.name}`;
        return res.send({ acknowledged: false, message });
      }
      const result = await bookingscollection.insertOne(booking);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.log);

//////////////////////////////////////////

app.get("/", async (req, res) => {
  res.send("LASt assignment running");
});

app.listen(port, () => {
  console.log(`app listening on the port ${port}`);
});
