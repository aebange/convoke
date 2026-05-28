package com.convoke.models.groups;

import java.time.LocalDateTime;
import java.util.List;

public class GetGroupDetailDTO {
    private int id;
    private String name;
    private LocalDateTime createdAt;
    private List<Integer> memberIds;
    private List<GetGroupEventDTO> events;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<Integer> getMemberIds() { return memberIds; }
    public void setMemberIds(List<Integer> memberIds) { this.memberIds = memberIds; }

    public List<GetGroupEventDTO> getEvents() { return events; }
    public void setEvents(List<GetGroupEventDTO> events) { this.events = events; }
}
