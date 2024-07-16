import "reflect-metadata"
import { expect } from "chai"
import { DataSource } from "../../../src/data-source/DataSource"
import {
    closeTestingConnections,
    createTestingConnections,
} from "../../utils/test-utils"
import { ReallyReallyVeryVeryVeryLongTableName } from "./entity/ReallyReallyVeryVeryVeryLongTableName"
import { QueryFailedError } from "../../../src/error/QueryFailedError"

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

    it("should be able to work with long sequence name with short table name", () => {
        // Borrowed from issue-10043.ts
        Promise.all(
            connections.map(async (connection) => {
                await connection.runMigrations()

                const sqlInMemory = await connection.driver
                    .createSchemaBuilder()
                    .log()

                sqlInMemory.upQueries.length.should.equal(0)
                sqlInMemory.downQueries.length.should.equal(0)
            }),
        )
    });

    it("should be able to work with long sequence name with long table name", () =>
        Promise.all(
            connections.map(async (connection) => {
                const long = new ReallyReallyVeryVeryVeryLongTableName()
                long.Name = "Eora"
                await connection
                    .getRepository(ReallyReallyVeryVeryVeryLongTableName)
                    .save(long)
                return expect(connection.synchronize()).to.not.be.rejectedWith(
                    QueryFailedError,
                )
            }),
        ))
})
