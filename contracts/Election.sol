// SPDX-License-Identifier: MIT
pragma solidity <0.9.0;
pragma experimental ABIEncoderV2;

contract Election {
    struct Candidate {
        string name;
        uint votes;
        uint id;
    }

    mapping (uint => Candidate) candidates;
    mapping (address => bool) voters;

    uint public candidatesCount;

    event votedEvent (
        uint indexed _candidateId
    );

    function addCandidate (string memory _name) public {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(_name, 0, candidatesCount);
    }

    function getCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory result = new Candidate[](candidatesCount);
        for (uint i = 0; i < candidatesCount; i++) {
            result[i] = candidates[i + 1];
        }
        return result;
    }

    function totalVotesFor(uint _candidateId) public view returns (uint) {
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        return candidates[_candidateId].votes;
    }

    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].votes ++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }

    function winner() public view returns (string memory) {
        // find the candidate with the most votes
        uint winnerId = 1;
        for (uint i = 2; i <= candidatesCount; i++) {
            if (candidates[i].votes > candidates[winnerId].votes) {
                winnerId = i;
            }
        }

        // return the winner
        return candidates[winnerId].name;
    }
}