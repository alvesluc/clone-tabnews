/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    username: {
      // For reference, the GitHub username is limited to 39 characters.
      type: "varchar(32)",
      unique: true,
      notNull: true,
    },
    email: {
      // Why 254? https://stackoverflow.com/a/1199238
      type: "varchar(254)",
      unique: true,
      notNull: true,
    },
    password: {
      // Why 60? https://npmjs.com/package/bcrypt#hash-info
      type: "varchar(60)",
      notNull: true,
    },
    created_at: {
      type: "timestamptz",
      default: pgm.func("timezone('utc', now())"),
      notNull: true,
    },
    updated_at: {
      type: "timestamptz",
      default: pgm.func("timezone('utc', now())"),
      notNull: true,
    },
  });
};

exports.down = false;
