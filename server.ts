import app from "./src/app";
import { config } from "./src/config/config";

const startServer = () => {
    // const port = process.env.PORT || 3000;
    const port = config.port || 3000;

    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });
};

startServer();
