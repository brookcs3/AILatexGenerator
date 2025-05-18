import { parseNotesWithOmitTags } from '../utils'

describe('parseNotesWithOmitTags', () => {
  it('handles strict OMIT tags', () => {
    const input = '<OMIT>secret</OMIT>'
    const result = parseNotesWithOmitTags(input)
    expect(result).toEqual({
      processedNotes: 'secret',
      containsOmitTags: true,
      isStrictOmit: true,
    })
  })

  it('handles embedded OMIT tags', () => {
    const input = 'Hello <OMIT>remove</OMIT> world'
    const result = parseNotesWithOmitTags(input)
    expect(result).toEqual({
      processedNotes: 'Hello [REMOVE THIS CONTENT: "remove"] world',
      containsOmitTags: true,
      isStrictOmit: false,
    })
  })
})
