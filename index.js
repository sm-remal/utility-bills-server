const express = require('express');
const cors = require('cors');


const app = express();
const port = process.env.PORT || 3000;


// Root route for testing server
app.get("/", (req, res) => {
    res.send("Utility Pay Server is running");
})

// Server listen
app.listen(port, () => {
    console.log(`Utility Pay Server at port: ${port}`)
});