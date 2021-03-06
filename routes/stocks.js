var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var Stock = require('../models/stock');


server.listen(process.env.PORT || 4000);

// socket io
io.on('connection', function (socket) {
  console.log('User connected');
  socket.on('disconnect', function() {
    console.log('User disconnected');
  });
  socket.on('save-stock', function (data) {
    console.log(data);
    io.emit('new-stock', { message: data });
  });
});

io.on('connection', function (socket) {
  console.log('User connected2');
  socket.on('disconnect', function() {
    console.log('User disconnected2');
  });
  socket.on('delete-send', function(deleted) {
    console.log(deleted);
    io.emit('delete-receive', {message: deleted});
  });
});


router.get('/', function(req, res) {
  Stock.find()
.exec(function(err, stocks) {
  if (err) {
    return res.status(500).json({
      title: "An error occured",
      error: err
    })
  }
  res.status(200).json({
    message: "stocks found!",
    obj: stocks
  })
})
})

router.post('/', function(req, res) {
  Stock.findOne({name: req.body.name}, function(err, stock) {
    if (err) {
      return res.status(500).json({
        title: "an error occured",
        error: err
      })
    }
    if (!stock) {
      var newstock = new Stock({
        name: req.body.name,
        data: req.body.data,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        desc: req.body.desc,
        today: req.body.today
      })
      newstock.save(function(err, newstock) {
        if (err) {
          return res.status(500).json({
            title: 'an error occured',
            error: err
          })
        }
        res.status(200).json({
          message: "stock successfully saved",
          obj: newstock
        })
      })
    }
    if (stock) {
      if (stock.name === req.body.name) {
        return res.status(500).json({
          title: 'You already entered this stock',
          error: {message: "You cannot enter the same stock twice"}
        })
      }
    }
  })
})


router.delete('/:id', function(req, res) {
  Stock.findById(req.params.id, function(err, stock) {
    if (err) {
      return res.status(500).json({
        title: "an error occured",
        error: err
      })
    }
    if (!stock) {
      return res.status(500).json({
        title: "stock not found",
        error: {message: "stock not found"}
      })
    }
    stock.remove(function(err, stock) {
      if (err) {
        return res.status(500).json({
          title: "an error occured",
          error: err
        })
      }
      res.status(200).json({
        message: "stock deleted",
        obj: stock
      })
    })
  })
})




module.exports = router;
