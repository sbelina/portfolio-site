import { randomBytes, pbkdf2Sync } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
const test=process.argv.includes('--test')
const destination=test?'.dev.vars.test':'.dev.vars'
if(!test){try{await readFile(destination);throw Error('Existing .dev.vars preserved. Remove it deliberately to rotate credentials.')}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e}}
const password=test?'synthetic-trial-password-not-an-owner-credential':randomBytes(24).toString('base64url')
const salt=randomBytes(16).toString('hex'), hash=pbkdf2Sync(password,Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex')
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()
await writeFile(destination,`OWNER_PASSWORD_HASH=${salt}:${hash}\nOWNER_NAME=${test?'Synthetic Trial Owner':'Local Owner'}\nAPPLICATION_REVISION=${revision}\n`,{mode:0o600})
if(test)console.log('Synthetic test-only credentials configured in ignored .dev.vars.test.')
else {
 await writeFile('.studio-password',password+'\n',{mode:0o600})
 console.log('Local owner credentials saved in ignored .dev.vars and .studio-password. Read the password locally; never paste it into chat. This trial cannot bind publicly.')
}
