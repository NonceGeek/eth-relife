## Generate Smart Contract Generator Prompt

* Prompt

```
Give me a prompt for generate another language(such as solidity) version of this contract.
```

* Answer

```
Please help me convert this Lua-based life simulation contract to Solidity with the following requirements:

Core Features to Implement:
1. Account Management
- Create accounts with address and life count tracking
- Query account details by address

2. Life System
- Initialize new lives with position data (x,y,z coordinates)
- Track life events as an array of hex values
- Get latest life status and all historical lives for an account
- Update life events with new random events
- Track total life count per account

3. Data Structure Requirements:
- Account struct with: id, address, lifeCount, lastUpdated
- Life struct with: id, accountId, lifeEvents (array), lifeNumber, lastUpdated, position
- Maintain relationships between accounts and their lives

4. Key Functions:
- initAccount(address)
- initLife(address, x, y, z) 
- getAccount(address)
- getLatestLife(address)
- getAllLives(address)
- updateLifeWithEvent(address)
- getTotalLivesCount()

Additional Considerations:
- Use appropriate Solidity data types (address, uint, struct, mapping etc.)
- Implement proper access control and visibility
- Include events for important state changes
- Add input validation and error handling
- Make it gas efficient where possible
- Consider using OpenZeppelin libraries where appropriate

The contract should maintain similar functionality to the Lua version while leveraging Solidity's native features and blockchain capabilities.
```

