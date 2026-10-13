export const GameObjectives = () => (
    <div className="column gap-8px">
        <h2>Game objectives</h2>
        <span>There are several plant types to interact with in this game.</span>
        
        <h3>Banana trees</h3>
        <span>Bananas are easy to collect, but have strict requirements for the trees to be harvested.</span>
        <span>These trees grow to a random height 4 to 15 and then grow a banana at their top.</span>
        <span>Use the move(Up) or move(Down) functions to climb or descend the tree, and move(Left) or move(Right) to move horizontally to the next tree.</span>
        <span>You can use can_harvest() to tell you if the tree has a fruit at your current position.</span>
        <span>However to clear the trees, you must report the sum of all heights of the banana trees at position (0, 0).</span>
        <span>Calling report(n) from any other position other than (0, 0) will do nothing. Calling report(n) with an incorrect total will result in no banana trees being cut down.</span>

        <h3>Orange trees</h3>
        <span>Orange trees grow to a random height from 1 to 3.</span>
        <span>Orange trees follow a strict hierarchy. Orange trees must be harvested in descending order of height.</span>
        <span>In stricter terms:</span>
        <span>An orange tree when harvested will yield 0 oranges if any tree shorter than it has already been harvested.</span>
        <span>An orange tree when harvested will yield 0 oranges if any tree taller than it has not yet been harvested.</span>
        <span>An orange tree when harvested will yield 0 oranges if there are no taller or shorter trees in the field.</span>
        <span>Orange trees can easily be cleared by calling report(0) at position (0, 0).</span>
    </div>
)
