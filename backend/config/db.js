const mysql = require('mysql')
const conn = mysql.createPool({
  host: "34.101.240.168",
  user: "root",
  password: "123",
  charset: "utf8mb4",
  database: "presensidb",
  timezone: '+00:00'
})
conn.getConnection((err) => {
  if (err) throw err
  console.log('Connected!')
})

module.exports = conn
