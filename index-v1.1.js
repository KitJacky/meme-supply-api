const axios = require("axios");
const express = require("express");
require("dotenv").config();

const { Decimal } = require("@cosmjs/math");

const app = express();
const API = process.env.API_ENDPOINT;
const PORT = process.env.PORT || 3010;
const DIVIDE_BY = `1e${process.env.COIN_DECIMALS || 1}`;

async function fetchData(endpoint) {
  try {
    const response = await axios.get(`${API}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error.message);
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


app.get("/v1/total-supply", async (_, res) => {
  try {
    const totalSupply = await fetchTotalSupply();
    res.send(`${totalSupply}`);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/v1/circulating-supply", async (_, res) => {
  try {
    const circulatingSupply = await fetchCirculatingSupply();
    res.send(`${circulatingSupply}`);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/v1/total-staked", async (_, res) => {
 try {
      const totalStaked = await fetchtotalStaked();
      res.send(`${totalStaked}`);
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
});


app.get("/v1/bonded-ratio", async (_, res) => {
 try {
     const bondedRatio = await fetchbondedRatio();
     res.send(`${bondedRatio}`);
    } catch (error) {
     res.status(500).send("Internal Server Error");
    }
});

app.get("/v1/community-pool", async (_, res) => {
	try {
		const communityPool = await fetchcommunityPool();
		 res.send(`${communityPool}`);
	} catch (error) {
		res.status(500).send("Internal Server Error");
	}
});

app.get("/v1/apr", async (_, res) => {
try {
	const apr = await fetchAPR();
	res.send(`${apr}`);
} catch (error) {
	res.status(500).send("Internal Server Error");
}
});


app.get("/v1/denom", async (_, res) => {
	res.send("MEME");
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

	 </body></html>`);
});


app.get("/v1", async (_, res) => {
res.json({

});
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
