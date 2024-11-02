"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
/**
 * Request to see if API is running
 */
app.get("/", (req, res) => {
    res.status(200).send('API is up and running');
});
/**
 * Router for users Table
 */
app.use('/user', user_route_1.default);
/**
 * API port on 4000
 */
app.listen(4000, () => {
    console.log("Server running!");
});
//# sourceMappingURL=server.js.map