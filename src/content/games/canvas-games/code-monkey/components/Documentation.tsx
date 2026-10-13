export const Documentation = () => (
    <div className="column gap-8px">
        <h2>Documentation</h2>
        <span>This is a game about writing code to control a monkey.</span>
        
        <h3>Code style</h3>
        <span>The programming language available is generally like Python, with somewhat limited support.</span>
        
        <h4>Features supported</h4>
        <ul>
            <li>Variables</li>
            <li>Numbers</li>
            <li>Booleans</li>
            <li>Mathematical operators: + - * / % += -= *= /= %=</li>
            <li>Relative operators: &gt; &lt; &gt;= &lt;= == !=</li>
            <li>Boolean operators: or not and</li>
            <li>Function definitions (def), return</li>
            <li>While loops, break</li>
            <li>Limited for loops, only possible with the range function</li>
            <li>print(), but with no string support</li>
            <li>If statements, elif, else</li>
        </ul>

        <h4>Special functions available</h4>
        <dl>
            <dt>move(direction)</dt>
            <dd>Can be called with Up, Down, Left, or Right to make the monkey move.</dd>

            <dt>can_move(direction)</dt>
            <dd>Can be called with Up, Down, Left, or Right. Returns whether moving in that direction is possible.</dd>

            <dt>stop()</dt>
            <dd>Stop the whole program immediately.</dd>

            <dt>get_x()</dt>
            <dd>Returns the monkey's x position.</dd>

            <dt>get_y()</dt>
            <dd>Returns the monkey's y position.</dd>

            <dt>get_width()</dt>
            <dd>Returns the number of spaces wide that the world is.</dd>

            <dt>get_height()</dt>
            <dd>Returns the number of spaces tall that the world is.</dd>

            <dt>coin_flip()</dt>
            <dd>Returns true or false with 50% probability.</dd>

            <dt>plant(plantType)</dt>
            <dd>
                Can be called from the ground in an empty space with Banana or Orange. The monkey will plant a tree
                which will grow according to the details of that tree.
            </dd>

            <dt>is_grown()</dt>
            <dd>
                Indicates whether the plant at your x-position is fully grown or not.
            </dd>

            <dt>can_harvest()</dt>
            <dd>If the monkey is in a space that contains a banana they can harvest.</dd>

            <dt>harvest()</dt>
            <dd>Harvest the banana in the monkey's current space.</dd>

            <dt>report(n)</dt>
            <dd>
                Can be called once the field is full of fully grown trees whose bananas have already been harvested.
                Must be called from (0, 0) with the sum of the heights of all trees in the field. Once this is done the
                field will be cleared of trees and reset.
            </dd>

            <dt>dump_all()</dt>
            <dd>
                Logs the state of all closure contexts to the console. Likely not useful but could be used to log a
                flag as an indicator in debugging.
            </dd>
        </dl>
    </div>
)
