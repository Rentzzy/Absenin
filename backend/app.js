const express = require('express')
const app = express()
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const conn = require('./config/db')
const session = require('express-session');
const path = require('path');

app.use(express.json())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(bodyParser.json());


const allowedOrigins = ['http://127.0.0.1:5501', 'http://127.0.0.1:5500', 'https://pertemuan1-415104.et.r.appspot.com'];
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to true if using HTTPS
}));


app.use(express.static(path.join(__dirname, 'public')));

app.get('/logo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'logo.html'));
});

app.post('/register', (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  const queryStr = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
  const values = [username, hashedPassword, role];

  conn.query(queryStr, values, (err, results) => {
      if (err) {
          return res.status(500).json({
              success: false,
              message: 'Error registering user',
              error: err
          });
      }
      res.status(200).json({
          success: true,
          message: 'User registered successfully'
      });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const queryStr = 'SELECT * FROM users WHERE username = ?';
  conn.query(queryStr, [username], (err, results) => {
      if (err) {
          return res.status(500).json({
              success: false,
              message: 'Error logging in',
              error: err
          });
      }

      if (results.length === 0) {
          return res.status(404).json({
              success: false,
              message: 'User not found'
          });
      }

      const user = results[0];
      const passwordIsValid = bcrypt.compareSync(password, user.password);

      if (!passwordIsValid) {
          return res.status(401).json({
              success: false,
              message: 'Invalid password'
          });
      }

      // Set session
      req.session.user = {
          id: user.id,
          username: user.username,
          role: user.role
      };

      res.status(200).json({
          success: true,
          message: 'Login successful',
          role: user.role,
          id : user.id,
          username : user.username
      });
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).json({
              success: false,
              message: 'Error logging out',
              error: err
          });
      }
      res.status(200).json({
          success: true,
          message: 'Logout successful'
      });
  });
});


 
app.get('/mahasiswa', function (req, res) {
  const queryStr = 'SELECT * FROM mahasiswa';
  conn.query(queryStr, (err, results) => {
    if (err) {
      res.error(err.sqlMessage, res);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menampilkan data",
        "data" : results
      });
    }
  })
})

app.post('/mahasiswa-nim', function (req, res) {
  const param = req.body;
  const NIM = param.NIM;
  const queryStr = 'SELECT * FROM mahasiswa WHERE NIM=?';
  const values = [NIM];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      res.error(err.sqlMessage, res);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menampilkan data",
        "data" : results
      });
    }
  })
})


app.post('/mahasiswa', function (req, res) {
  const param = req.body;
  const NIM = param.NIM;
  const Nama = param.Nama;
  const jurusan = param.jurusan;
  const queryStr = 'INSERT INTO mahasiswa (NIM ,Nama, jurusan) VALUES (?, ?, ?)';
  const values = [NIM, Nama, jurusan];

  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menyimpan data",
        "data" : null
      });
    }
  })
})

app.put('/mahasiswa', function (req, res) {
  const param = req.body;
  const NIM = param.NIM;
  const Nama = param.Nama;
  const jurusan = param.jurusan;
  const queryStr = 'UPDATE mahasiswa SET Nama= ?, jurusan=? WHERE NIM =?';
  const values = [Nama, jurusan, NIM];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses mengubah data",
        "data" : null
      });
    }
  })
})

app.delete('/mahasiswa', function (req, res) {
  const param = req.body;
  const NIM = param.NIM;
  const queryStr = 'DELETE FROM mahasiswa WHERE NIM = ?';
  // const now = new Date();
  const values = [NIM];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menghapus data",
        "data" : null
      });
    }
  })
})


app.get('/dosen', function (req, res) {
  const queryStr = 'SELECT * FROM dosen';
  conn.query(queryStr, (err, results) => {
    if (err) {
      res.error(err.sqlMessage, res);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menampilkan data",
        "data" : results
      });
    }
  })
})

app.post('/dosen-npm', function (req, res) {
  const param = req.body;
  const NPM = param.NPM;
  const queryStr = 'SELECT * FROM dosen WHERE NPM=?';
  const values = [NPM];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      res.error(err.sqlMessage, res);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menampilkan data",
        "data" : results
      });
    }
  })
})

app.post('/dosen', function (req, res) {
  const param = req.body;
  const NPM = param.NPM;
  const Nama = param.Nama;
  const queryStr = 'INSERT INTO dosen (NPM ,Nama_dosen) VALUES (?, ?)';
  const values = [NPM, Nama];

  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menyimpan data",
        "data" : null
      });
    }
  })
})

app.put('/dosen', function (req, res) {
  const param = req.body;
  const NPM = param.NPM;
  const Nama = param.Nama;
  const queryStr = 'UPDATE dosen SET Nama_dosen= ? WHERE NPM =?';
  const values = [Nama, NPM];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses mengubah data",
        "data" : null
      });
    }
  })
})

app.delete('/dosen', function (req, res) {
  const param = req.body;
  const NPM = param.NPM;
  const queryStr = 'DELETE FROM dosen WHERE NPM = ?';
  // const now = new Date();
  const values = [NPM];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menghapus data",
        "data" : null
      });
    }
  })
})
//Kelas
app.get('/kelas', function (req, res) {
  const queryStr = 'SELECT * FROM kelas';
  conn.query(queryStr, (err, results) => {
    if (err) {
      res.error(err.sqlMessage, res);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menampilkan data",
        "data" : results
      });
    }
  })
})

app.post('/kelas-id', function (req, res) {
  const param = req.body;
  const id = param.id;
  const queryStr = 'SELECT * FROM kelas WHERE id_kelas=?';
  const values = [id];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      res.error(err.sqlMessage, res);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menampilkan data",
        "data" : results
      });
    }
  })
})

app.post('/kelas-dosen', function (req, res) {
  const param = req.body;
  const npm = param.npm;
  const queryStr = 'SELECT * FROM kelas WHERE Dosen=?';
  const values = [npm];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      res.error(err.sqlMessage, res);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menampilkan data",
        "data" : results
      });
    }
  })
})


app.post('/kelas', function (req, res) {
  const param = req.body;
  const id = param.id;
  const Matkul = param.Matkul;
  const Dosen = param.Dosen;
  const Mulai = param.Mulai;
  const Berakhir = param.Berakhir;
  const queryStr = 'INSERT INTO kelas (Id_kelas,	Matkul,	Dosen,	Mulai,	Berakhir) VALUES (?, ?, ?, ?, ?)';
  const values = [id, Matkul, Dosen, Mulai, Berakhir];

  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menyimpan data",
        "data" : null
      });
    }
  })
})

app.put('/kelas', function (req, res) {
  const param = req.body;
  const id = param.id;
  const Matkul = param.Matkul;
  const Mulai = param.Mulai;
  const Berakhir = param.Berakhir;
  const queryStr = 'UPDATE kelas SET Matkul=?, Mulai=?,	Berakhir=? WHERE id_kelas =?';
  const values = [Matkul, Mulai, Berakhir, id];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses mengubah data",
        "data" : null
      });
    }
  })
})

app.delete('/kelas', function (req, res) {
  const param = req.body;
  const id = param.id;
  const queryStr = 'DELETE FROM kelas WHERE id_kelas = ?';
  // const now = new Date();
  const values = [id];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menghapus data",
        "data" : null
      });
    }
  })
})

// PRESENSI
app.post('/presensi-nim', function (req, res) {
  const param = req.body;
  const NIM = param.NIM;
  const queryStr = 'SELECT * FROM presensi WHERE NIM=?';
  const values = [NIM];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      res.error(err.sqlMessage, res);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menampilkan data",
        "data" : results
      });
    }
  })
})

app.post('/presensi-kelas', function (req, res) {
  const param = req.body;
  const kelas = param.kelas;
  const queryStr = 'SELECT * FROM presensi WHERE Kelas=?';
  const values = [kelas];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      res.error(err.sqlMessage, res);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menampilkan data",
        "data" : results
      });
    }
  })
})

app.post('/presensi', function (req, res) {
  const param = req.body;
  const NIM = param.NIM;
  const kelas = param.kelas;
  const dosen = param.dosen;
  const now = new Date();
  const queryStr = 'INSERT INTO presensi (NIM ,Kelas, Dosen, Hadir) VALUES (?, ?, ?, ?)';
  const values = [NIM, kelas, dosen, now];

  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menyimpan data",
        "data" : null
      });
    }
  })
})

app.delete('/presensi', function (req, res) {
  const param = req.body;
  const id = param.id;
  const queryStr = 'DELETE FROM presensi WHERE id= ?';
  const values = [id];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menghapus data",
        "data" : null
      });
    }
  })
})


//USER

app.get('/users', function (req, res) {
  const queryStr = 'SELECT * FROM users';
  conn.query(queryStr, (err, results) => {
    if (err) {
      res.error(err.sqlMessage, res);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menampilkan data",
        "data" : results
      });
    }
  })
})


app.post('/users', function (req, res) {
  const param = req.body;
  const username = param.username;
  const password = param.password;
  const role = param.role;
  const queryStr = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
  const values = [username, password, role];

  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menyimpan data",
        "data" : null
      });
    }
  })
})

app.put('/users', function (req, res) {
  const param = req.body;
  const id = param.id;
  const username = param.username;
  const password = param.password;
  const hashedPassword = bcrypt.hashSync(password, 8);
  const queryStr = 'UPDATE users SET username=?, password=? WHERE id =?';
  const values = [username, hashedPassword, id];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses mengubah data",
        "data" : null
      });
    }
  })
})

app.delete('/users', function (req, res) {
  const param = req.body;
  const id = param.id;
  const queryStr = 'DELETE FROM users WHERE id = ?';
  const values = [id];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menghapus data",
        "data" : null
      });
    }
  })
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

