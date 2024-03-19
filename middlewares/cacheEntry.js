import { catchAsyc } from "../utils/catchAsync.js";
import { redis } from "../redisClient.js";

export const cache = catchAsyc(async (req, res, next) => {
    if (redis.status !== "ready") {
        return next();
    }
    const cachedData = await redis.get("data");
    if (cachedData) {
        console.log("using cached data");
        const parseJson = JSON.parse(cachedData);
        return res.status(200).json({ data: parseJson });
    }
    next();
});
