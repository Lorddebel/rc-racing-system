package M5Project.RC.Dao;

import M5Project.RC.Resource.DBChallenge;
import M5Project.RC.model.Challenge;

public enum ChallengeDao {
    instance;

    public boolean challengeRequest(String challenger, String challengee) {
        if (DBChallenge.checkIfFriends(challenger, challengee)) {
            if (!DBChallenge.alreadyInAChallenge(challenger, challengee))
                return true;
        }
        return false;
    }

    public boolean respondToChallenge(int challengeID, String challengee) {
        return DBChallenge.respondToChallenge(challengee, challengeID);
    }

}
