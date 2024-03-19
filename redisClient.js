import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => console.log("Redis online"));
redis.on("error", (msg) => {
    console.log("Unable to connect to redis.");
    redis.disconnect();
});

export { redis };
