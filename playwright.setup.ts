import dotenv from 'dotenv';


export default async function globalSetup() {

    if (process.env.CI !== "true") {
        dotenv.config({ path: '.env.local' });
        console.log('Loaded env.local');
    } else {
        console.log('Using default secrets');
    }
}
