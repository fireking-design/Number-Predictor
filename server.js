import express from 'express'
const app = express()
import { execSync } from 'child_process';
import path from 'path'

app.use(bodyParser.json())

app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'README.md')))

app.post('/deploy', (request, response) => {
    if (request.query.secret !== process.env.SECRET) return response.status(401).send('Wrong secret');
  
    if (request.body.ref !== 'refs/heads/glitch') return response.status(200).send('Push was not to glitch branch, so did not deploy.');
  
    const repoUrl = request.body.repository.git_url

    console.log('Fetching latest changes.')
    const output = execSync(`git checkout -- ./ && git pull -X theirs ${repoUrl} glitch && refresh`).toString();
    console.log(output)
    return response.status(200).send()
})

app.listen(process.env.PORT, () => console.log(`Your app is listening on port ${process.env.PORT}`));