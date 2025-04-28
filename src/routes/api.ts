import exporess from "express";
import dummyController from "../controllers/dummy.controller";
const router = exporess.Router();

router.get("/dummy", dummyController.dummy);

export default router;
