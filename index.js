const axios = require("axios");
const express = require("express");
require("dotenv").config();
const { Decimal } = require("@cosmjs/math");

const app = express();
const PORT = process.env.PORT || 3010;
const DIVIDE_BY = `1e${process.env.COIN_DECIMALS || 1}`;
const INTERVAL = process.env.INTERVAL;
const DENOM = process.env.DENOM;

const API_ENDPOINTS = [process.env.API_ENDPOINT1, process.env.API_ENDPOINT2, process.env.API_ENDPOINT3];
let currentApiIndex = 0;

function getCurrentApi() {
	  return API_ENDPOINTS[currentApiIndex % API_ENDPOINTS.length];
}

function useNextApi() {
	  currentApiIndex++;
}


// Cache object
let cache = {
  totalSupply: null,
  circulatingSupply: null,
  communityPool: null,
  totalStaked: null,
  bondedRatio: null,
  apr: null
};


async function fetchData(endpoint) {
  try {
    const response = await axios.get(`${getCurrentApi()}${endpoint}`);
	  //console.log(response.headers);
	  console.log(response.config.url);
	  return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${getCurrentApi()}${endpoint}:`, error.message);
    useNextApi(); 
    throw new Error("Internal Server Error");
  }
}


async function fetchTotalSupply() {
  const data = await fetchData(
    `/cosmos/bank/v1beta1/supply/${process.env.COIN_DENOM}`
  );
  return data.amount.amount / DIVIDE_BY;
}

async function fetchCirculatingSupply() {
  const communityPool = (
    await fetchData("/cosmos/distribution/v1beta1/community_pool")
  ).pool[0].amount;
  const totalSupply = await fetchTotalSupply();
  return totalSupply - communityPool / DIVIDE_BY;
}

async function fetchcommunityPool() {
const communityPool = (
            await fetchData("/cosmos/distribution/v1beta1/community_pool")
          ).pool[0].amount;
        return communityPool / DIVIDE_BY;
}

async function fetchtotalStaked() {
        const staked = await fetchData(
           "/cosmos/staking/v1beta1/pool"
        );
        totalstaked = staked.pool.bonded_tokens;
        return Decimal.fromAtomics(totalstaked, 6).toString();
}

async function fetchbondedRatio() {
        const totalSupply = await fetchTotalSupply();
        const totalStaked = await fetchtotalStaked();
        return totalStaked / totalSupply;
}


async function fetchAPR() {
        const bondedRatio = await fetchbondedRatio();
        return 35 / bondedRatio;
}



async function updateCache() {
  try {
    cache.totalSupply = await fetchTotalSupply();
	  console.log(cache.totalSupply);
    cache.circulatingSupply = await fetchCirculatingSupply();
	  console.log(cache.circulatingSupply);
    cache.communityPool = await fetchcommunityPool();
	  console.log(cache.communityPool);
    cache.totalStaked = await fetchtotalStaked();
	  console.log(cache.totalStaked);
    cache.bondedRatio = await fetchbondedRatio();
	  console.log(cache.bondedRatio);
    cache.apr = await fetchAPR();
	  console.log(cache.apr);
    console.log("Cache updated");
  } catch (error) {
    console.error("Error updating cache:", error.message);
  }
}



// Update cache every minute
setInterval(updateCache, `${INTERVAL}`);


app.get("/v1/total-supply", (_, res) => {
  res.send(`${cache.totalSupply}`);
});

app.get("/v1/circulating-supply", (_, res) => {
  res.send(`${cache.circulatingSupply}`);
});

app.get("/v1/community-pool", (_, res) => {
  res.send(`${cache.communityPool}`);
});

app.get("/v1/total-staked", (_, res) => {
  res.send(`${cache.totalStaked}`);
});

app.get("/v1/bonded-ratio", (_, res) => {
  res.send(`${cache.bondedRatio}`);
});

app.get("/v1/apr", (_, res) => {
  res.send(`${cache.apr}`);
});


app.get("/v1/denom", async (_, res) => {
        res.send(DENOM);
});


app.get("/", async (_, res) => {
 res.send(`<html><head></head><body>
    The API routes listed below return values in MEME of MEME Network:<br>
    <a href=/v1/total-supply>/v1/total-supply</a><br>
    <a href=/v1/circulating-supply>/v1/circulating-supply</a><br>
    <a href=/v1/total-staked>/v1/total-staked</a><br>
    <a href=/v1/bonded-ratio>/v1/bonded-ratio</a><br>
    <a href=/v1/community-pool>/v1/community-pool</a><br>
    <a href=/v1/apr>/v1/apr</a><br>
<a href=/v1/denom>/v1/denom</a><br>
<a href=/v1>/v1</a><br>

         </body></html>`);
});


app.get("/v1", async (_, res) => {
res.json({
	apr:cache.apr, 
	totalSupply:cache.totalSupply, 
	circulatingSupply:cache.circulatingSupply,
	communityPool:cache.communityPool,
	totalStaked:cache.totalStaked,
	bondedRatio:cache.bondedRatio,
	denom:DENOM,
	version:"MEME API v1.3, JK Labs : https://3jk.net"
});
});


updateCache().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

