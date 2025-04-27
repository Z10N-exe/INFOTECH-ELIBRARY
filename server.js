const express = require('express');
const formidable = require('formidable');
const { Octokit } = require("@octokit/rest");
const { Base64 } = require('js-base64'); // Import js-base64

const app = express();
const port = 5000;

// Important:  Use environment variables for your token!  Good practice.
const githubToken = process.env.GITHUB_TOKEN;
const githubUsername = 'Z10N-exe';
const githubRepo = 'INFOTECH-ELIBRARY'; //  Just the repo name, not the full URL.
const targetBranch = 'uploads';
const filesDirectoryInRepo = 'uploads/'; //  Include trailing slash for consistency

const octokit = new Octokit({ auth: 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  });

app.post('/upload', (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error processing form:', err);
            return res.status(500).send('Error uploading file.');
        }

        if (!files.file) {
            return res.status(400).send('No file uploaded.');
        }

        const uploadedFile = files.file;
        const fileContent = require('fs').readFileSync(uploadedFile.filepath);
        const base64FileContent = Base64.encode(fileContent); // Use js-base64
        const fileName = uploadedFile.originalFilename;
        const filePathInRepo = `${filesDirectoryInRepo}${fileName}`;

        try {
            const refResponse = await octokit.git.getRef({
                owner: githubUsername,
                repo: githubRepo,
                ref: `refs/heads/${targetBranch}`
            });
            const latestCommitSha = refResponse.data.object.sha;

            const blobResponse = await octokit.git.createBlob({
                owner: githubUsername,
                repo: githubRepo,
                content: base64FileContent,
                encoding: 'base64'
            });
            const blobSha = blobResponse.data.sha;

            const treeResponse = await octokit.git.createTree({
                owner: githubUsername,
                repo: githubRepo,
                base_tree: latestCommitSha,
                tree: [{
                    path: filePathInRepo,
                    mode: '100644',
                    type: 'blob',
                    sha: blobSha,
                }],
            });
            const newTreeSha = treeResponse.data.sha;

            const commitResponse = await octokit.git.createCommit({
                owner: githubUsername,
                repo: githubRepo,
                message: `Add file: ${fileName}`,
                tree: newTreeSha,
                parents: [latestCommitSha],
            });
            const newCommitSha = commitResponse.data.sha;

            await octokit.git.updateRef({
                owner: githubUsername,
                repo: githubRepo,
                ref: `refs/heads/${targetBranch}`,
                sha: newCommitSha,
            });

            console.log(`File "${fileName}" uploaded to GitHub.`);
            res.send('File uploaded successfully!');

        } catch (error) {
            console.error('Error interacting with GitHub API:', error);
            res.status(500).send('Error uploading file to GitHub.');
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
