const express = require('express')
const { MongoClient } = require("mongodb");
const app = express();
app.use(express.json());

const url = 'mongodb+srv://amritmin:Humanity%409899009407@semcluster.13j3qlv.mongodb.net/test';

// Create a new MongoClient
const client = new MongoClient(url);

const database = client.db("hotel-management");

var cors = require('cors');
app.use(cors());
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


app.post('/user', async (req, res) => {
    const userData = req.body;
    console.log(userData);
    const userCollection = database.collection("user-data");
    const result = await userCollection.insertOne(userData);
    console.log(result);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
    if (result.acknowledged === true) {
        return res.send(200);
    } else {
        res.send(400);
    }
});

app.post('/login', async (req, res) => {
    const {email, password} = req.body;
    const userCollection = database.collection("user-data");
    const user = await userCollection.findOne({email});
    console.log("USER:", user);
    if(!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password is correct
    if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    return res.status(200).json({ message: 'Login successful', email: user.email, name: user.name, type: user.type });
})

app.post('/addRoom', async (req, res) => {
    const roomData = req.body;
    const userCollection = database.collection("room-data");
    // Count the number of existing rooms to generate the next room ID
    const count = await userCollection.countDocuments();
    const roomId = 'room' + (count + 1);
    // Add the room ID to the room data
    roomData.roomId = roomId;
    roomData.bookedDates=[];
    console.log(roomData);
    const result = await userCollection.insertOne(roomData);
    console.log(result);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
    if (result.acknowledged === true) {
        return res.send(200);
    } else {
        res.send(400);
    }
});

app.put('/updateRoom/:id', async (req, res) => {
    const roomId = req.params.id;
    const roomData = req.body;
    const filter = { roomId: roomId };
    const roomCollection = database.collection("room-data");
    
    const updateDoc = {
      $set: {
        name: roomData.name,
        detail: roomData.detail,
        price: roomData.price,
        type: roomData.type,
        amenities: roomData.amenities,
        roomId: roomId,
        bookedDates: roomData.bookedDates
      },
    };

    const options = { upsert: false };
    const result = await roomCollection.updateOne(filter, updateDoc, options);
    console.log(result)
    if (result.matchedCount === 0) {
        res.status(400).json({ message : 'Not Found'})
    } else if (result.modifiedCount === 1) {
        res.status(200).json({ message : 'Updated'})
    } else {
        res.status(400).json({ message : 'Error'})
    }
});

app.post('/addBooking', async (req, res) => {
    const bookingData = req.body;
    const bookingCollection = database.collection("booking-data");
    const count = await bookingCollection.countDocuments();
    const bookingId = 'booking' + (count + 1);
    // Add the booking ID to the room data
    bookingData.bookingId = bookingId;
    console.log(bookingData);
    const result = await bookingCollection.insertOne(bookingData);
    console.log(result);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
    if (result.acknowledged === true) {
        return res.send(200);
    } else {
        res.send(400);
    }
});


app.put('/updateBooking/:id', async (req, res) => {
    const bookingId = req.params.id;
    const bookingData = req.body;
    const filter = { bookingId: bookingId };
    const bookingCollection = database.collection("booking-data");
    
    const updateDoc = {
      $set: {
        bookingId: bookingId,
        bookedDates: bookingData.bookedDates,
        name: bookingData.name,
        detail: bookingData.detail,
        price: bookingData.price
      },
    };

    const options = { upsert: false };
    const result = await bookingCollection.updateOne(filter, updateDoc, options);
    if (result.matchedCount === 0) {
        res.status(400).json({ message : 'Not Found'})
    } else if (result.modifiedCount === 1) {
        res.status(200).json({ message : 'Updated'})
    } else {
        res.status(400).json({ message : 'Error'})
    }
});

app.get('/rooms', async (req, res) => {

    // Retrieve the "type" query parameter value
    const type = req.query.type;
    const roomCollection = database.collection("room-data");


    const r = await roomCollection.find({ type: type }).toArray();
    if (r.length > 0) {
        res.send(r);
      } else {
        res.status(400).json({message: 'Not found'});
      }
    
})

app.get('/findBooking', async (req, res) => {
    const email = req.query.email;
    const bookingCollection = database.collection("booking-data");

    const r = await bookingCollection.find({email}).toArray();
    if (!r) {
        res.status(400).json({message: 'Not found'});
      } else {
        res.send(r);
      }
})

app.get('/findRoom', async (req, res) => {

    // Retrieve the "type" query parameter value
    const roomId = req.query.id;
    const roomCollection = database.collection("room-data");

    const r = await roomCollection.findOne({roomId});
    if (!r) {
        res.status(400).json({message: 'Not found'});
      } else {
        res.send(r);
      }
    
})

app.get('/allBookings', async (req, res) => {
    const bookingCollection = database.collection("booking-data");
    const r = await bookingCollection.find({}).toArray();
    if (r.length > 0) {
        res.send(r);
      } else {
        res.status(400).json({message: 'Not found'});
      }
})

  
const PORT = 8080;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));