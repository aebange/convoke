package com.convoke.models.groups;

public class GetGroupEventDateVoteDTO {
    private int memberId;
    private String vote;

    public int getMemberId() { return memberId; }
    public void setMemberId(int memberId) { this.memberId = memberId; }

    public String getVote() { return vote; }
    public void setVote(String vote) { this.vote = vote; }
}
