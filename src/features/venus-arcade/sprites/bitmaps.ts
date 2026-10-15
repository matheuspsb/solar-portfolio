export type SpriteName =
  'crawler' | 'beetle' | 'drone' | 'glitch' | 'data' | 'patch' | 'eye' | 'lock';

export type SpriteFrames = readonly (readonly string[])[];

export const SPRITES: Record<SpriteName, SpriteFrames> = {
  crawler: [
    ['..X..X..', '...XX...', '.XXXXXX.', 'XXoXXoXX', '.XXXXXX.', 'X.X..X.X', '.X....X.'],
    ['..X..X..', '...XX...', '.XXXXXX.', 'XXoXXoXX', '.XXXXXX.', '.X.XX.X.', 'X......X'],
  ],
  beetle: [
    [
      '...XXXXX...',
      '..XXXXXXX..',
      'X.XoXXXoX.X',
      'XXXXXXXXXXX',
      '.XXXX.XXXX.',
      'X.XXX.XXX.X',
      '..X..X..X..',
      '.X.......X.',
    ],
    [
      '...XXXXX...',
      '..XXXXXXX..',
      'X.XoXXXoX.X',
      'XXXXXXXXXXX',
      '.XXXX.XXXX.',
      'X.XXX.XXX.X',
      '.X...X...X.',
      'X.........X',
    ],
  ],
  drone: [
    [
      '....X....',
      '...XXX...',
      '..XXoXX..',
      'X.XXXXX.X',
      'XXXXXXXXX',
      'X.XXXXX.X',
      '...X.X...',
      '...X.X...',
    ],
  ],
  glitch: [['..X.....', '.XXX..X.', 'XX.XXXX.', '.XXX.XXX', '..XXXX.X', '.X..XX..', 'X....X..']],
  data: [['XXXXXXXX', 'X......X', 'X.XX.X.X', 'X......X', 'X.X.XX.X', 'X......X', 'XXXXXXXX']],
  patch: [['..X..', '.XXX.', 'XXXXX', '.XXX.', '..X..']],
  eye: [
    ['..XXXXX..', '.X.....X.', 'X..XXX..X', 'X.XXoXX.X', 'X..XXX..X', '.X.....X.', '..XXXXX..'],
  ],
  lock: [['..XXX..', '.X...X.', '.X...X.', 'XXXXXXX', 'XXX.XXX', 'XXX.XXX', 'XXXXXXX', 'XXXXXXX']],
};
