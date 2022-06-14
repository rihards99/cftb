const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const bodyParser = require("body-parser");

const app = express()
const port = 3000
const dbSource = "db.sqlite"

let db = new sqlite3.Database(dbSource, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message)
    throw err
  } else {
      console.log('Connected to the SQLite database.')
      db.run(`
          CREATE TABLE comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp text,
            commentText text,
            name text,
            thumbnail text
          )
        `,
      (err) => {
          if (err) {
              // Table already created
          } else {
              // Table just created, creating some rows
              const insert = 'INSERT INTO comments (timestamp, commentText, name, thumbnail) VALUES (?,?,?,?)'
              db.run(insert, [
                '1655190034000',
                `Jeepers now that's a huge release with some big community earnings to back it - it must be so rewarding seeing creators quit their day jobs after monetizing (with real MRR) on the new platform.`,
                'Rob Hope',
                'https://randomuser.me/api/portraits/thumb/men/3.jpg',
              ])
              db.run(insert, [
                '1655203709486',
                `Switched our blog from Hubspot to Ghost a year ago -- turned out to be a great decision. Looking forward to this update....the in-platform analytics look especially delicious. :)`,
                'Sophie Brecht',
                'https://randomuser.me/api/portraits/thumb/women/3.jpg',
              ])
          }
      });
  }
});

app.use(express.static('static'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/comments', (req, res) => {
  db.all('SELECT * FROM comments ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      comments: rows.map(row => ({
        id: row.id,
        timestamp: row.timestamp,
        user: {
          name: row.name,
          thumbnail: row.thumbnail,
        },
        text: row.commentText,

      }))
    })
  });
})

app.post('/comment', (req, res) => {
  const data = req.body;
  const insert = 'INSERT INTO comments (timestamp, commentText, name, thumbnail) VALUES (?,?,?,?)'
  db.run(insert, [
    data.timestamp,
    data.commentText,
    data.name,
    data.thumbnail,
  ], (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else {
      res.json({ status: 'SUCCESS'})
    }
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})