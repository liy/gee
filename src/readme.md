Loop through all nodes

Close branch when index reaches the line end index, tracked by `index -> lane index` map.

If node has multiple parents, visit them in sequence so that parent[0] can be the trunk.
Open free lane when traversing parents[1..n], and record when the branch should be closed by checking branch base.

If current node is visited, only need traverse other parents: parent[1..n], since the trunk must already be visited.

If traversing trunk, use first node lane index as the branch's lane index.
If traversing branch, use lane index queried as the branch's lane index.

If the parents[1..n] of a merge node is visited, then this must be a sync merge, have to manually track the sync line section, since the line needs avoiding overlap and also direct connect 2 nodes. This is an edge case when drawing the edge.
