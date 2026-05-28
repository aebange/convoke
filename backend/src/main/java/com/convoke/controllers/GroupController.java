package com.convoke.controllers;

import com.convoke.models.groups.CreateGroupDTO;
import com.convoke.models.groups.GetGroupDTO;
import com.convoke.models.groups.GetGroupDetailDTO;
import com.convoke.models.groups.GetGroupNameAvailabilityDTO;
import com.convoke.services.GroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @RequestMapping(value = "/api/groups/create", method = RequestMethod.POST)
    public ResponseEntity<GetGroupDTO> createGroup(@RequestBody CreateGroupDTO createGroupDTO) throws Exception {
        GetGroupDTO created = groupService.createGroup(createGroupDTO);
        return ResponseEntity.status(201).body(created);
    }

    @RequestMapping(value = "/api/groups", method = RequestMethod.GET)
    public ResponseEntity<List<GetGroupDTO>> getGroups() throws Exception {
        List<GetGroupDTO> groups = groupService.getGroups();
        return ResponseEntity.ok(groups);
    }

    @RequestMapping(value = "/api/groups/check-name/{name}", method = RequestMethod.GET)
    public ResponseEntity<GetGroupNameAvailabilityDTO> checkGroupName(@PathVariable("name") String name) throws Exception {
        GetGroupNameAvailabilityDTO result = groupService.checkGroupName(name);
        return ResponseEntity.ok(result);
    }

    @ResponseBody
    @RequestMapping(value = "/api/groups/{name}", method = RequestMethod.GET)
    public ResponseEntity<GetGroupDetailDTO> getGroup(@PathVariable("name") String name) throws Exception {
        GetGroupDetailDTO group = groupService.getGroup(name);
        return ResponseEntity.ok(group);
    }
}
