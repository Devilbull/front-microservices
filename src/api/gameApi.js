import { gameApi } from "@/api/axios";

export default {
    getAll(params) {
        return gameApi.get("/games/all", { params });
    },
    addGame(data) {
        return gameApi.post("/games/add-game", data);
    },
    deleteGame(gameName) {
        return gameApi.post("/games/delete-game", { gameName });
    },
    deleteAll() {
        return gameApi.post("/games/delete-all-games");
    },
};
