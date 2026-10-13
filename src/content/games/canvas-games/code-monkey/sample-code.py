def farm_loop():
    for i in range(get_width()):
        plant(Banana)
        move(Right)

    total_heights = 0
    for i in range(get_width()):
        while not is_grown() or can_move(Up):
            move(Up)
        harvest()
        total_heights += get_y() + 1

        while can_move(Down) and not can_move(Left):
            move(Down)
        move(Left)

    report(total_heights)

def orange_loop():
    for i in range(get_width()):
        plant(Orange)
        move(Right)

    # Just wait for tree to grow to simplify logic
    while not is_grown():
        move(Down)

    height = 2
    direction = Left
    while height >= 0:
        end_x = 0
        if direction == Right:
            end_x = get_width() - 1
        while get_x() != end_x:
            while (not is_grown() or can_move(Up)) and get_y() < height:
                move(Up)
            if get_y() == height and can_harvest():
                harvest()
            while can_move(Down) and not can_move(direction):
                move(Down)
            move(direction)

        if direction == Left:
            direction = Right
        else:
            direction = Left
        height -= 1

    while can_move(Down):
        move(Down)
    while can_move(Left):
        move(Left)

    report(0)

while 1:
    orange_loop()
    farm_loop()
