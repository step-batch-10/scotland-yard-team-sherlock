import { describe, it } from "testing/bdd";
import { assert, assertEquals, assertFalse } from "assert";
import { Room } from "../../src/models/room.ts";

describe("Room", () => {
  it("should return false if player does not exists", () => {
    const room = new Room(6);
    assertFalse(room.has("112"));
  });

  it("should return true if player exists in the room", () => {
    const room = new Room(6, false, [{ name: "Name", id: "111" }]);
    assert(room.has("111"));
  });

  it("should remove the player", () => {
    const room = new Room(2, false, [{ name: "Name1", id: "111" }]);
    const players = room.remove("111");

    assertFalse(players);
    assertEquals(room.players, []);
  });

  it("should return true if room is full", () => {
    const room = new Room(2, false, [
      { name: "Name1", id: "111" },
      { name: "Name", id: "123" },
    ]);

    assert(room.isFull);
  });

  it("should return false if room is not full", () => {
    const room = new Room(4, false, [
      { name: "Name1", id: "111" },
      { name: "Name", id: "123" },
    ]);

    assertFalse(room.isFull);
  });
});
