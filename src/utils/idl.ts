

export const IDL ={
  "address": "G48CMVhqv9r9qpbg9zbFwWj1LSe9d5jnRRvE6rzfNNZS",
  "metadata": {
    "name": "note_app",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "create_note",
      "discriminator": [
        103,
        2,
        208,
        242,
        86,
        156,
        151,
        107
      ],
      "accounts": [
        {
          "name": "user_profile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "note",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "relations": [
            "user_profile"
          ]
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "create_user",
      "discriminator": [
        108,
        227,
        130,
        130,
        252,
        109,
        75,
        218
      ],
      "accounts": [
        {
          "name": "user_profile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        }
      ]
    },
    {
      "name": "delete_note",
      "docs": [
        "Deletes a note by closing the account"
      ],
      "discriminator": [
        182,
        211,
        115,
        229,
        163,
        88,
        108,
        217
      ],
      "accounts": [
        {
          "name": "note",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "arg",
                "path": "note_id"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "relations": [
            "note"
          ]
        }
      ],
      "args": [
        {
          "name": "_note_id",
          "type": "u64"
        }
      ]
    },
    {
      "name": "share_note",
      "discriminator": [
        133,
        20,
        255,
        39,
        159,
        235,
        185,
        37
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "note",
          "writable": true
        },
        {
          "name": "shared_access",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "note"
              },
              {
                "kind": "arg",
                "path": "friend"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "friend",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "update_note",
      "discriminator": [
        103,
        129,
        251,
        34,
        33,
        154,
        210,
        148
      ],
      "accounts": [
        {
          "name": "note",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "arg",
                "path": "note_id"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "relations": [
            "note"
          ]
        }
      ],
      "args": [
        {
          "name": "_note_id",
          "type": "u64"
        },
        {
          "name": "new_content",
          "type": "string"
        }
      ]
    },
    {
      "name": "update_shared_note",
      "discriminator": [
        65,
        85,
        124,
        179,
        222,
        20,
        39,
        94
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "note",
          "writable": true
        },
        {
          "name": "shared_access",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "note"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "new_content",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Note",
      "discriminator": [
        203,
        75,
        252,
        196,
        81,
        210,
        122,
        126
      ]
    },
    {
      "name": "SharedAccess",
      "discriminator": [
        133,
        221,
        251,
        154,
        37,
        64,
        34,
        178
      ]
    },
    {
      "name": "UserProfile",
      "discriminator": [
        32,
        37,
        119,
        205,
        179,
        180,
        13,
        194
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "UnauthorizedAccess",
      "msg": "You are not authorized to perform this action"
    }
  ],
  "types": [
    {
      "name": "Note",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "content",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "SharedAccess",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "friend",
            "type": "pubkey"
          },
          {
            "name": "note_pda",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "UserProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "note_count",
            "type": "u64"
          }
        ]
      }
    }
  ]
}
export type NoteAppIDL = typeof IDL;
