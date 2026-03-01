
async function searchApify() {
    const res = await fetch('https://api.apify.com/v2/actor-store/actors?search=linkedin%20jobs');
    const data = await res.json();
    console.log(data);
}
searchApify();

