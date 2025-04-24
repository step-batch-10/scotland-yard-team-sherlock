import { describe, it } from "testing/bdd";
import { assert, assertEquals, assertFalse } from "assert";
import { Room } from "../../src/models/room.ts";

describe("Room", () => {
  it("should return false if player does not exists", () => {
    const room = new Room(6);
    assertFalse(room.hasPlayer("112"));
  });

  it("should return true if player exists in the room", () => {
    const room = new Room(6, [{ name: "Name", id: "111" }]);
    assert(room.hasPlayer("111"));
  });

  it("shoudl add new player and should not return players", () => {
    const room = new Room(6);
    const players = room.addPlayer({ name: "Name", id: "111" });
    assertFalse(players);
  });

  it("should return players if players count reached capacity", () => {
    const room = new Room(2, [{ name: "Name1", id: "111" }]);
    const players = room.addPlayer({ name: "Name2", id: "222" });

    assertEquals(players, [{ name: "Name1", id: "111" }, {
      name: "Name2",
      id: "222",
    }]);
  });

  it("should remove the player", () => {
    const room = new Room(2, [{ name: "Name1", id: "111" }]);
    const players = room.leave("111");

    assertFalse(players);
    assertEquals(room.players, []);
  });
});
