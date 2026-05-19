package com.convoke.models.groups;

import java.time.LocalDate;
import java.util.List;

public class GetGroupEventDateDTO {
    private int id;
    private LocalDate proposedDate;
    private List<GetGroupEventDateVoteDTO> votes;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public LocalDate getProposedDate() { return proposedDate; }
    public void setProposedDate(LocalDate proposedDate) { this.proposedDate = proposedDate; }

    public List<GetGroupEventDateVoteDTO> getVotes() { return votes; }
    public void setVotes(List<GetGroupEventDateVoteDTO> votes) { this.votes = votes; }
}
