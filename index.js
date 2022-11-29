const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
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
//////////////////veryfyjwt//////////////////////////////////
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

////////////////////////////////////////////////////////
async function run() {
  try {
    const catagoriescollection = client
      .db("last-assignment")
      .collection("catagories");
    const itemscollection = client.db("last-assignment").collection("items");
    const bookingscollection = client
      .db("last-assignment")
      .collection("booking");
    const userscollection = client.db("last-assignment").collection("users");

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
    //////////
    app.get("/booking", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }

      const query = { email: email };
      const booking = await bookingscollection.find(query).toArray();
      res.send(booking);
    });
    ///////////////////////////users/////////////////////

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await userscollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "2hr",
        });
        return res.send({ accestoken: token });
      }
      res.status(403).send({ accestoken: "" });
    });

    /////////////
    app.post("/users", async (req, res) => {
      const user = req.body;

      const result = await userscollection.insertOne(user);
      console.log(result);
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
