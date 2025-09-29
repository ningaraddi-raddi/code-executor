








// // execute.js (Final version for this phase)
// const { exec } = require('child_process');
// const fs = require('fs');
// const path = require('path');

// const executeCode = (language, code,stdin) => {
//     return new Promise((resolve, reject) => {
//         const userId = `temp_user_${Date.now()}`;
//         const tempDir = `/home/${userId}`;
//         const filename = `script.tmp`;
//         const filepath = path.join(tempDir, filename);

//         let runCommand;
//         switch (language) {
//             case 'javascript':
//                 runCommand = `node ${filepath}`;
//                 break;
//             case 'python':
//                 runCommand = `python3 ${filepath}`;
//                 break;
//             default:
//                 return reject(new Error('Unsupported language'));
//         }

//         // Add the -f flag to userdel
//         // const escapedCode = code.replace(/'/g, "'\\''").replace(/"/g, '\\"');
//         const escapedCode = code.replace(/'/g, "'\\''").replace(/"/g, '\\"');
//         const escapedStdin = stdin.replace(/'/g, "'\\''").replace(/"/g, '\\"');


//       const command = `
//             sudo useradd -m ${userId} && \\
//             sudo sh -c "echo '${escapedCode}' > ${filepath}" && \\
//             sudo chown ${userId}:${userId} ${filepath} && \\
//             echo '${escapedStdin}' | sudo -u ${userId} bash -c "ulimit -t 10 -f 256; ${runCommand}" && \\
//             sudo userdel -r -f ${userId}
//         `;

//         exec(command, (error, stdout, stderr) => {
//     // ** THE FIX IS HERE **
//     // Check if there's an error, but ignore the specific 'mail spool not found' warning.
//     if (error && !stderr.includes('mail spool')) {
//         exec(`sudo userdel -r -f ${userId}`);
//         return reject({ error: error.message, stderr });
//     }

//     // Also check if stderr has content, but again, ignore the mail spool warning.
//     if (stderr && !stderr.includes('mail spool')) {
//         return reject({ stderr });
//     }

//     resolve({ stdout });
// });
//     });
// };

// module.exports = {
//     executeCode,
// };












// execute.js (Corrected and Final)
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const executeCode = (language, code, stdin) => { // Added stdin
    // ---> THE FIX IS HERE: Provide a default value for stdin
    stdin = stdin || '';

    return new Promise((resolve, reject) => {
        const userId = `temp_user_${Date.now()}`;
        const tempDir = `/home/${userId}`;
        const filename = `script.tmp`;
        const filepath = path.join(tempDir, filename);

        let runCommand;
        switch (language) {
            case 'javascript':
                runCommand = `node ${filepath}`;
                break;
            case 'python':
                runCommand = `python3 ${filepath}`;
                break;
            default:
                return reject(new Error('Unsupported language'));
        }

        // Escape all inputs to prevent shell injection
        const escapedCode = code.replace(/'/g, "'\\''").replace(/"/g, '\\"');
        const escapedStdin = stdin.replace(/'/g, "'\\''").replace(/"/g, '\\"');

        const command = `
            sudo useradd -m ${userId} && \\
            sudo sh -c "echo '${escapedCode}' > ${filepath}" && \\
            sudo chown ${userId}:${userId} ${filepath} && \\
            echo '${escapedStdin}' | sudo -u ${userId} bash -c "ulimit -t 10 -f 256; ${runCommand}" && \\
            sudo userdel -r -f ${userId}
        `;

        exec(command, (error, stdout, stderr) => {
            // Check for errors, but ignore the specific 'mail spool not found' warning.
            if (error && !stderr.includes('mail spool')) {
                exec(`sudo userdel -r -f ${userId}`);
                return reject({ error: error.message, stderr });
            }
            if (stderr && !stderr.includes('mail spool')) {
                return reject({ stderr });
            }
            resolve({ stdout });
        });
    });
};

module.exports = {
    executeCode,
};