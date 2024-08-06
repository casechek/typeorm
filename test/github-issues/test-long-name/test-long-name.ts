import "reflect-metadata"
import { DataSource } from "../../../src/data-source/DataSource"
import {
    closeTestingConnections,
    createTestingConnections,
} from "../../utils/test-utils"
import {expect} from "chai";


/**
 * @see https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS
 * "The system uses no more than NAMEDATALEN-1 bytes of an identifier; longer names can be
 * written in commands, but they will be truncated. By default, NAMEDATALEN is 64 so the
 * maximum identifier length is 63 bytes. If this limit is problematic, it can be raised
 * by changing the NAMEDATALEN constant in src/include/pg_config_manual.h."
 */
describe("github issues > #7106 shorten sequence names (for RDBMS with a limit) when they are longer than 63 characters", () => {
    let connections: DataSource[]
    before(
        async () =>
            (connections = await createTestingConnections({
                entities: [__dirname + "/entity/*{.js,.ts}"],
                migrations: [__dirname + "/migration/*{.js,.ts}"],
                schemaCreate: false,
                dropSchema: true,
                enabledDrivers: ["postgres"],
            })),
    )
    after(() => closeTestingConnections(connections))

    it("should be able to work with long sequence name with short table name", async () => {
        // Borrowed from issue-10043.ts
        await Promise.all(
            connections.map(async (connection) => {
                await expect(connection.driver
                        .createSchemaBuilder()
                        .log()
                ).rejectedWith('idx_short_table_name_asdfadsfadsfadsfafsgdfsgsdfgsdfgdfsgsdfgdfadfadsfasdfadfadsfasdf exceeds database max length of 63!')
            }),
        )
    });
})
