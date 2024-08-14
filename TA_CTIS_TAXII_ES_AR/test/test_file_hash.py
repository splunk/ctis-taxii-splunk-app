from TA_CTIS_TAXII_ES_AR.package.bin.cim_to_stix.file_hash import file_hash_looks_like

def test_blank_string():
    assert file_hash_looks_like("") is None

def test_md5():
    assert file_hash_looks_like("cead3f77f6cda6ec00f57d76c9a6879f") == "MD5"

def test_sha1():
    assert file_hash_looks_like("23d22c4e7fc62edfdea86a0e9a94c57a2c640e26") == "SHA-1"

def test_sha256():
    assert file_hash_looks_like("bf07a7fbb825fc0aae7bf4a1177b2b31fcf8a3feeaf7092761e18c859ee52a9c") == "SHA-256"

def test_sha512():
    assert file_hash_looks_like("3dd28c5a23f780659d83dd99981e2dcb82bd4c4bdc8d97a7da50ae84c7a7229a6dc0ae8ae4748640a4cc07ccc2d55dbdc023a99b3ef72bc6ce49e30b84253dae") == "SHA-512"
