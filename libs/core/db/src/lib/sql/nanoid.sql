
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Generate a random nanoid of specified size
CREATE OR REPLACE FUNCTION nanoid(size int DEFAULT 30)
RETURNS text AS $$
DECLARE
  id text := '';
  i int := 0;
  urlAlphabet char(64) := 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW';
  bytes bytea := gen_random_bytes(size);
  byte int;
  pos int;
BEGIN
  WHILE i < size LOOP
    byte := get_byte(bytes, i);
    pos := (byte & 63) + 1;
    id := id || substr(urlAlphabet, pos, 1);
    i := i + 1;
  END LOOP;
  RETURN id;
END
$$ LANGUAGE PLPGSQL VOLATILE;



-- Generate nanoid with timestamp hash
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION nanoid_timestamp_aware(
  nano_size int DEFAULT 21,        -- Length of the random nanoid part
  hash_size int DEFAULT 9,         -- Length of the timestamp-hash part
  alphabet text DEFAULT 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW'
)
RETURNS text AS $$
DECLARE
  final_id text := '';
  i int := 0;
  byte int;
  pos int;
  alphabet_len int := length(alphabet);

  -- Generate hash from current timestamp (up to microseconds)
  time_hash bytea := digest(now()::text, 'sha256');
  hash_part text := '';

  -- Generate random bytes for nanoid portion
  random_bytes bytea := gen_random_bytes(nano_size);
  nano_part text := '';

  -- Temporary variables for shuffling
  shuffled_id text := '';
  j int;
  temp_char char;
BEGIN
  -- Build hash prefix
  WHILE i < hash_size LOOP
    byte := get_byte(time_hash, i);
    pos := (byte % alphabet_len) + 1;
    hash_part := hash_part || substr(alphabet, pos, 1);
    i := i + 1;
  END LOOP;

  -- Reset counter for nano part
  i := 0;

  -- Build nanoid random part
  WHILE i < nano_size LOOP
    byte := get_byte(random_bytes, i);
    pos := (byte & 63) + 1;
    nano_part := nano_part || substr(alphabet, pos, 1);
    i := i + 1;
  END LOOP;

  -- Combine hash and nanoid
  final_id := hash_part || nano_part;

  -- Shuffle final_id using Fisher-Yates shuffle
  shuffled_id := final_id;
  FOR i IN 1..length(final_id) LOOP
    j := floor(random() * (length(final_id) - i + 1)) + i;
    temp_char := substring(shuffled_id from i for 1);
    shuffled_id := overlay(shuffled_id placing substring(shuffled_id from j for 1) 
                           from i for 1);
    shuffled_id := overlay(shuffled_id placing temp_char from j for 1);
  END LOOP;

  -- Return the shuffled ID
  RETURN shuffled_id;
END
$$ LANGUAGE PLPGSQL VOLATILE;
