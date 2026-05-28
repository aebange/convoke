package com.convoke.models.groups;

public class GetGroupEventRsvpDTO {
    private int memberId;
    private String status;

    public int getMemberId() { return memberId; }
    public void setMemberId(int memberId) { this.memberId = memberId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
