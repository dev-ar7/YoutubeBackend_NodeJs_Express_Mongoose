import { Router } from "express";

import { apiHealthcheck } from "../controllers/healthcheck.controllers.js"

const router = Router()

router.route('/').get(apiHealthcheck);

export default router;